import path from 'path';
import fs from 'fs';
import os from 'os';
import afs from 'fs/promises';
import { Injectable, Logger } from '@nestjs/common';
import { IReadableFile } from '@/types/common';
import { Media, Post } from './types';
import sharp from 'sharp';
import decompress from 'decompress';
import { isNil, negate, sortBy } from 'lodash';
import { RedisService } from '@/external/redis/redis.service';
import { PrefixerService } from '@/external/redis/prefixer.service';
import {
    TEMP_UPLOAD_PATH,
    INSTAGRAM_DATA_PATH,
    POSTS_CONFIG_PATH,
} from './constants';
import { CacheType } from '@/external/redis/types';
import { CacheTypeAll } from '@/external/redis/types';
import { MediaColorService } from '../media-color/media-color.service';

/**
 * Service for managing Instagram data processing and caching
 * Handles file uploads, media processing, and cache management
 */
@Injectable()
export class DataService {
    constructor(
        private readonly logger: Logger,
        private readonly redis: RedisService,
        private readonly prefixer: PrefixerService,
        private readonly mediaColorService: MediaColorService
    ) {}

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
                    .map(async (post: Post) => {
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

                        const [_full, location, fileName, extension] = match;

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
     * Processes all media files and updates their metadata
     * Converts images to WebP format and computes average colors
     * @returns Array of processed media items
     */
    public async getProcessedMedias(): Promise<Array<Media>> {
        this.logger.log('Processing medias...');

        const unzippedMedias = await this.getUnzippedMedias();
        const processedMedias: Media[] = [];

        for (const { media, location, fileName, extension } of unzippedMedias) {
            const cacheKey = this.prefixer.media(fileName);
            const cachedMedia = await this.redis.get(cacheKey);

            if (cachedMedia) {
                processedMedias.push(JSON.parse(cachedMedia));
                continue;
            }

            this.logger.log(`Processing file: ${media.uri}...`);

            media.uri = await this.convertMediaToWebp(
                media,
                location,
                fileName,
                extension
            );

            if (!media.uri) {
                continue;
            }

            const { hex, rgba, hsl } =
                await this.mediaColorService.calculateMediaColor(media.uri);
            media.average_color = hex;
            media.average_color_rgba = rgba;
            media.average_color_hsl = hsl;

            processedMedias.push(media);

            await this.redis.set(cacheKey, JSON.stringify(media));
            this.logger.log(`Media ${fileName} cached successfully`);
        }

        return processedMedias;
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

        await this.verifyCache(medias);
    }

    /**
     * Verifies and updates the cache for all media items
     * @param inputMedias - Array of media items to process
     */
    public async verifyCache(inputMedias: Media[]): Promise<void> {
        this.logger.log('Starting cache verification...');

        const medias = sortBy(inputMedias, (media) => media.average_color);

        this.logger.log('Updating cache...');

        const threadCount = os.cpus().length;
        await Promise.all(
            Array.from({ length: threadCount }, (_, workerIndex) =>
                this.mediaColorService.processMediasToColors({
                    medias,
                    threadCount,
                    workerIndex,
                })
            )
        );

        this.logger.log('Cache verification completed');
    }

    /**
     * Count keys by pattern using SCAN for memory efficiency
     * @param pattern Redis key pattern to match
     * @returns Number of matching keys
     */
    private async countKeys(pattern: `${CacheType}:*`): Promise<number> {
        let cursor = '0';
        let count = 0;

        do {
            const [nextCursor, keys] = await this.redis.scan(
                cursor,
                pattern,
                100
            );

            cursor = nextCursor;
            count += keys.length;
        } while (cursor !== '0');

        return count;
    }

    /**
     * Get cache statistics using memory-efficient SCAN
     * @returns Object containing counts of different cache types
     */
    async getCacheStats() {
        const stats = {
            color: 0,
            media: 0,
            total: 0,
        };

        try {
            stats.color = await this.countKeys('color:*');
            stats.media = await this.countKeys('media:*');
            stats.total = stats.color + stats.media;

            return stats;
        } catch (error) {
            this.logger.error(`Error getting cache stats: ${error.message}`);
            throw error;
        }
    }

    /**
     * Clear specific type of cache or all cache
     * @param type - Type of cache to clear
     * @returns Object containing information about the clearing operation
     */
    async clearCache(type: CacheType | CacheTypeAll = 'all') {
        this.logger.log(`Starting cache clearing for type: ${type}`);

        if (type === 'all') {
            await this.redis.flushdb();
            this.logger.log('All cache cleared successfully');
            return {
                type,
                message: 'All cache cleared successfully',
            };
        }

        let cursor = '0';
        let deletedCount = 0;

        do {
            const [nextCursor, keys] = await this.redis.scan(
                cursor,
                `${type}:*`,
                100
            );
            cursor = nextCursor;

            if (keys.length > 0) {
                await this.redis.pipeline(
                    keys.map((key) => async (pipeline) => pipeline.del(key))
                );
                deletedCount += keys.length;
            }
        } while (cursor !== '0');

        if (deletedCount === 0) {
            this.logger.log(`No cache found for type: ${type}`);
        } else {
            this.logger.log(`Cleared ${deletedCount} ${type} cache entries`);
        }

        return {
            type,
            entriesCleared: deletedCount,
            message: `Cache cleared successfully`,
        };
    }

    private async convertMediaToWebp(
        media: { uri: string },
        location: string,
        fileName: string,
        extension: string
    ): Promise<string | null> {
        try {
            const newMediaUri = `${location}/${fileName}.webp`;

            switch (extension) {
                case 'webp':
                    return media.uri;
                default:
                    await sharp(media.uri).webp().toFile(newMediaUri);

                    this.logger.log(`Media ${newMediaUri} converted to webp`);

                    return newMediaUri;
            }
        } catch (error) {
            this.logger.error(
                `Error processing media ${media.uri}: ${error.message}`
            );

            return null;
        }
    }
}
