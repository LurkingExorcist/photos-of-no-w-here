import fs from 'fs';
import afs from 'fs/promises';
import path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import decompress from 'decompress';
import { isNil, negate } from 'lodash';
import sharp from 'sharp';

import { CacheService } from '../cache/cache.service';
import { MediaColorService } from '../media-color/media-color.service';

import {
    INSTAGRAM_DATA_PATH,
    POSTS_CONFIG_PATH,
    TEMP_UPLOAD_PATH,
} from './data.constants';
import { IReadableFile, Media, Post } from './data.types';

interface GetMediaOptions {
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

/**
 * Service for managing Instagram data processing and caching
 * Handles file uploads, media processing, and cache management
 */
@Injectable()
export class DataService {
    private readonly logger = new Logger(DataService.name);

    constructor(
        private readonly cacheService: CacheService,
        private readonly mediaColorService: MediaColorService
    ) {}

    /**
     * Handles the upload and processing of an Instagram data archive
     * @param archive - The uploaded archive file
     */
    public async upload(archive: IReadableFile) {
        await this.unzipArchive(archive);

        const medias = await this.getProcessedMedias();
        const posts = this.createPosts(medias);

        this.logger.log('Overriding old posts data...');

        await afs.writeFile(POSTS_CONFIG_PATH, JSON.stringify(posts));

        this.logger.log('Overriding complete');

        await this.cacheService.verifyCache(medias);
    }

    /**
     * Processes all media files and updates their metadata
     * Converts images to WebP format and computes average colors
     * @returns Array of processed media items
     */
    public async getProcessedMedias(): Promise<Array<Media>> {
        this.logger.log('Processing medias...');

        const unzippedMedias = await this.getUnzippedMedias();
        const processedMedias: Media[] = [];

        for (const { media, location, fileName, extension } of unzippedMedias) {
            const cachedMedia = await this.cacheService.get('media', fileName);

            if (cachedMedia) {
                processedMedias.push(JSON.parse(cachedMedia));
                continue;
            }

            this.logger.log(`Processing file: ${media.uri}...`);

            media.uri = await this.convertMediaToWebp({
                media,
                location,
                fileName,
                extension,
            });

            if (!media.uri) {
                continue;
            }

            const { hex, rgba, hsl } =
                await this.mediaColorService.calculateMediaColor(media.uri);
            media.average_color = hex;
            media.average_color_rgba = rgba;
            media.average_color_hsl = hsl;

            processedMedias.push(media);

            await this.cacheService.set(
                'media',
                fileName,
                JSON.stringify(media)
            );
            this.logger.log(`Media ${fileName} cached successfully`);
        }

        return processedMedias;
    }

    /**
     * Retrieves media items with filtering and pagination
     * @param options - Filtering and pagination options
     * @returns Promise resolving to paginated media items
     */
    public async getMedia(
        options: GetMediaOptions
    ): Promise<PaginatedResponse<Media>> {
        const { page, limit, startDate, endDate, title, uri } = options;
        const unzippedMedias = await this.getUnzippedMedias();

        // Extract just the media items from the unzipped data
        let mediaItems = unzippedMedias.map((item) => item.media);

        // Apply filters
        if (startDate) {
            mediaItems = mediaItems.filter(
                (media) => media.creation_timestamp >= startDate
            );
        }
        if (endDate) {
            mediaItems = mediaItems.filter(
                (media) => media.creation_timestamp <= endDate
            );
        }
        if (title) {
            const searchTitle = title.toLowerCase();
            mediaItems = mediaItems.filter((media) =>
                media.title.toLowerCase().includes(searchTitle)
            );
        }
        if (uri) {
            const searchUri = uri.toLowerCase();
            mediaItems = mediaItems.filter((media) =>
                media.uri.toLowerCase().includes(searchUri)
            );
        }

        // Calculate pagination
        const total = mediaItems.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, total);

        // Get the page of items
        const items = mediaItems.slice(startIndex, endIndex);

        return {
            items,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Extracts and processes an uploaded Instagram data archive
     * @param file - The uploaded file information
     * @throws Error if the file is not a ZIP archive
     */
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

    /**
     * Retrieves and processes media files from the unzipped archive
     * @returns Array of processed media items with file information
     */
    private async getUnzippedMedias(): Promise<
        Array<{
            media: Media;
            fileName: string;
            location: string;
            extension: string;
        }>
    > {
        this.logger.log('Getting unzipped medias...');

        return afs
            .readFile(POSTS_CONFIG_PATH, { encoding: 'utf8' })
            .then((module) => JSON.parse(module))
            .then((posts) =>
                posts
                    .map((post: Post) => {
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

                        media.uri = absoluteMediaUri;

                        return {
                            media,
                            location,
                            fileName,
                            extension,
                        };
                    })
                    .filter(negate(isNil))
            );
    }

    /**
     * Creates Post objects from processed media items
     * @param medias - Array of processed media items
     * @returns Array of Post objects
     */
    private createPosts(medias: Media[]): Array<Post> {
        return medias.map((media) => ({
            media: [media],
        }));
    }

    private async convertMediaToWebp(options: {
        media: Media;
        location: string;
        fileName: string;
        extension: string;
    }): Promise<string | null> {
        try {
            const newMediaUri = `${options.location}/${options.fileName}.webp`;

            switch (options.extension) {
                case 'webp':
                    return options.media.uri;
                default:
                    await sharp(options.media.uri).webp().toFile(newMediaUri);

                    this.logger.log(`Media ${newMediaUri} converted to webp`);

                    return newMediaUri;
            }
        } catch (error) {
            this.logger.error(
                `Error processing media ${options.media.uri}: ${error.message}`
            );

            return null;
        }
    }
}
