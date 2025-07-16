import os from 'os';
import fs from 'fs';
import afs from 'fs/promises';
import path from 'path';
import { join } from 'path';
import { Worker } from 'worker_threads';

import { Injectable, Logger } from '@nestjs/common';
import decompress from 'decompress';
import { isNil, negate, sortBy } from 'lodash';
import sharp from 'sharp';
import { getAverageColor } from 'fast-average-color-node';

import { CacheService } from '@/modules/shared/cache/cache.service';
import { ConfigService } from '@/modules/shared/config/config.service';

import { MediaColorProcessorData } from './color-processor/color-processor.types';
import { rgbToHsl } from './color-processor/color-processor.utils';
import { HSLColor, HexColor, RGBAColor } from './data-processing.types';
import { IReadableFile, Media, Post } from './data-processing.types';
import { INSTAGRAM_DATA_PATH, POSTS_CONFIG_PATH, TEMP_UPLOAD_PATH } from './data.constants';

interface QueryMediaOptions {
    page: number;
    limit: number;
    startDate?: number;
    endDate?: number;
    title?: string;
    uri?: string;
}

interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class DataProcessingService {
    private readonly logger = new Logger(DataProcessingService.name);

    constructor(
        private readonly cacheService: CacheService,
        private readonly configService: ConfigService
    ) {}

    // Methods from data.service.ts
    public async upload(archive: IReadableFile) {
        await this.unzipArchive(archive);

        const medias = await this.loadMedias();
        const posts = this.createPosts(medias);

        this.logger.log('Overriding old posts data...');

        await afs.writeFile(POSTS_CONFIG_PATH, JSON.stringify(posts));

        this.logger.log('Overriding complete');

        await this.processMediasInParallel(medias);
    }

    public async queryMedia(
        options: QueryMediaOptions
    ): Promise<PaginatedResponse<Media>> {
        const { page, limit, startDate, endDate, title, uri } = options;
        let medias = await this.loadMedias();

        if (startDate) {
            medias = medias.filter(
                (media) => media.creation_timestamp >= startDate
            );
        }
        if (endDate) {
            medias = medias.filter(
                (media) => media.creation_timestamp <= endDate
            );
        }
        if (title) {
            const searchTitle = title.toLowerCase();
            medias = medias.filter((media) =>
                media.title.toLowerCase().includes(searchTitle)
            );
        }
        if (uri) {
            const searchUri = uri.toLowerCase();
            medias = medias.filter((media) =>
                media.uri.toLowerCase().includes(searchUri)
            );
        }

        const total = medias.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, total);

        const items = medias.slice(startIndex, endIndex);

        return {
            items,
            total,
            page,
            limit,
            totalPages,
        };
    }

    // Methods from media-color.service.ts
    private async calculateMediaColor(
        imagePath: string
    ): Promise<{ hex: HexColor; rgba: RGBAColor; hsl: HSLColor }> {
        try {
            const color = await getAverageColor(imagePath);

            return {
                hex: color.hex,
                rgba: color.value,
                hsl: rgbToHsl(...color.value),
            };
        } catch (error) {
            this.logger.error(
                `Error processing color for image ${imagePath}: ${error.message}`
            );
            throw error;
        }
    }

    private async processMediasToColors(
        options: MediaColorProcessorData
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const worker = this.createWorker({
                ...options,
                medias: sortBy(options.medias, (media) => {
                    const [h, s, l] = media.average_color_hsl;

                    return [h, l, s].map((c) => Math.floor(c * 256)).join('');
                }),
            });

            worker.on('message', (message: string) => {
                this.logger.log(message);
            });

            worker.on('error', (error: Error) => {
                this.logger.error(`Worker error: ${error.message}`);
                reject(error);
            });

            worker.on('exit', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Process medias in parallel
     * @param inputMedias - Array of media items to process
     */
    private async processMediasInParallel(inputMedias: Media[]): Promise<void> {
        this.logger.log('Starting parallel processing...');

        const threadCount = os.cpus().length;
        await Promise.all(
            Array.from({ length: threadCount }, (_, workerIndex) =>
                this.processMediasToColors({
                    medias: inputMedias,
                    threadCount,
                    workerIndex,
                })
            )
        );

        this.logger.log('Parallel processing completed');
    }

    private async unzipArchive({ originalname, buffer }: IReadableFile) {
        if (!originalname.endsWith('.zip')) {
            throw new Error('Zip file is required.');
        }

        this.logger.log(`Upload of '${originalname}' started`);

        const filePath = path.join(TEMP_UPLOAD_PATH, originalname);
        await afs.writeFile(filePath, buffer);

        this.logger.log(`Decompressing of '${originalname}' started...`);

        await decompress(filePath, INSTAGRAM_DATA_PATH);

        this.logger.log(`Decompressing of '${originalname}' finished`);
        this.logger.log(`Deleting of '${originalname}' started...`);

        fs.rmSync(filePath);

        this.logger.log(`Deleting of '${originalname}' finished`);
    }

    private async loadMedias(): Promise<Array<Media>> {
        this.logger.log('Loading medias...');

        return afs
            .readFile(POSTS_CONFIG_PATH, { encoding: 'utf8' })
            .then((module) => JSON.parse(module))
            .then((posts) =>
                Promise
                    .all(
                        posts.map(async (post: Post) => {
                            const {
                                media: [media],
                            } = post;

                            const absoluteMediaUri = path.resolve(
                                INSTAGRAM_DATA_PATH,
                                media.uri
                            );
                            const match =
                                absoluteMediaUri.match(/(.+)\/(.+)\.(\w+)$/);

                            if (!match) {
                                throw new Error(
                                    `Path ${absoluteMediaUri} doesn't fit to match pattern`
                                );
                            }

                            const [, location, fileName, extension] = match;

                            if (extension === 'mp4') {
                                return null;
                            }

                            const cachedMedia = await this.cacheService.get('media', fileName);

                            if (cachedMedia) {
                                return JSON.parse(cachedMedia);
                            }

                            media.uri = await this.ensureMediaIsWebp({
                                mediaUri: absoluteMediaUri,
                                location,
                                fileName,
                                extension,
                            });

                            const { hex, rgba, hsl } = await this.calculateMediaColor(media.uri);
                            media.average_color = hex;
                            media.average_color_rgba = rgba;
                            media.average_color_hsl = hsl;

                            await this.cacheService.set(
                                'media',
                                fileName,
                                JSON.stringify(media)
                            );
                            this.logger.log(`Media ${fileName} cached successfully`);

                            return media;
                        })
                    )
                    .then(medias => medias.filter(negate(isNil)))
            );
    }

    private createPosts(medias: Media[]): Array<Post> {
        return medias.map((media) => ({
            media: [media],
        }));
    }

    private async ensureMediaIsWebp(options: {
        mediaUri: string;
        location: string;
        fileName: string;
        extension: string;
    }): Promise<string | null> {
        try {
            const newMediaUri = `${options.location}/${options.fileName}.webp`;

            switch (options.extension) {
                case 'webp':
                    return options.mediaUri;
                default:
                    await sharp(options.mediaUri).webp().toFile(newMediaUri);

                    this.logger.log(`Media ${newMediaUri} converted to webp`);

                    return newMediaUri;
            }
        } catch (error) {
            this.logger.error(
                `Error processing media ${options.mediaUri}: ${error.message}`
            );

            return null;
        }
    }

    private createWorker(options: MediaColorProcessorData) {
        const workerPath =
            process.env.NODE_ENV === 'development'
                ? join(
                    process.cwd(),
                    'src/modules/features/data-processing/color-processor/color-processor.ts'
                )
                : join(
                    process.cwd(),
                    'dist/src/modules/features/data-processing/color-processor/color-processor.js'
                );

        const worker = new Worker(workerPath, {
            workerData: {
                ...options,
                redisConfig: {
                    host: this.configService.redisHost,
                    port: this.configService.redisPort,
                },
            },
            env: {
                NODE_ENV: process.env.NODE_ENV || 'development',
            },
            execArgv:
                process.env.NODE_ENV === 'development'
                    ? ['-r', 'ts-node/register']
                    : undefined,
        });
        return worker;
    }
} 