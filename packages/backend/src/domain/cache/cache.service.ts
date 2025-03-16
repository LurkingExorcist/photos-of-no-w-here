import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@/external/redis/redis.service';
import { PrefixerService } from './prefixer.service';
import { Media } from '../data/types';
import { MediaColorService } from '../media-color/media-color.service';
import { sortBy } from 'lodash';
import os from 'os';
import { CacheType, CacheTypeAll } from '@/external/redis/types';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(
        private readonly redis: RedisService,
        private readonly prefixer: PrefixerService,
        private readonly mediaColorService: MediaColorService
    ) {}

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
}
