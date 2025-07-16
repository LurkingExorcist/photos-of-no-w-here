import os from 'os';

import { Injectable, Logger } from '@nestjs/common';

import { CacheType, CacheTypeAll } from '@/modules/shared/cache/cache.types';
import { RedisService } from '@/modules/shared/cache/redis.service';

import { Media } from '@/modules/features/data-processing/data-processing.types';

import { PrefixerService } from './prefixer.service';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(
        private readonly redis: RedisService,
        private readonly prefixer: PrefixerService,
    ) {}

    /**
     * Retrieves a value from Redis cache with a prefixed key
     * @param type - The cache type
     * @param key - The cache key
     * @returns The cached value or null if not found
     */
    public async get(type: CacheType, key: string): Promise<string> {
        return await this.redis.get(this.prefixer.prefix(type, key));
    }

    /**
     * Sets a value in Redis cache with a prefixed key
     * @param type - The cache type
     * @param key - The cache key
     * @param value - The value to store
     */
    public async set(
        type: CacheType,
        key: string,
        value: string
    ): Promise<void> {
        await this.redis.set(this.prefixer.prefix(type, key), value);
    }

    /**
     * Get a slice of cache entries for a specific type
     * @param type - The type of cache to get entries from
     * @param start - Starting index (0-based)
     * @param count - Number of entries to return
     * @returns Array of cache entries with their keys and values
     */
    public async getCacheSlice(
        type: CacheType,
        start: number = 0,
        count: number = 10
    ): Promise<Array<{ key: string; value: string }>> {
        this.logger.log(
            `Getting cache slice for type: ${type}, start: ${start}, count: ${count}`
        );

        let cursor = '0';
        let entries: Array<{ key: string; value: string }> = [];
        let currentIndex = 0;

        do {
            const [nextCursor, keys] = await this.redis.scan(
                cursor,
                `${type}:*`,
                100
            );
            cursor = nextCursor;

            if (keys.length > 0) {
                const values = await Promise.all(
                    keys.map(async (key) => ({
                        key,
                        value: await this.redis.get(key),
                    }))
                );

                // Filter entries based on start and count
                const filteredValues = values.filter((_, index) => {
                    const globalIndex = currentIndex + index;
                    return globalIndex >= start && globalIndex < start + count;
                });

                entries = entries.concat(filteredValues);
                currentIndex += keys.length;

                // Break if we have enough entries
                if (entries.length >= count) {
                    entries = entries.slice(0, count);
                    break;
                }
            }
        } while (cursor !== '0');

        return entries;
    }

    /**
     * Get cache statistics using memory-efficient SCAN
     * @returns Object containing counts of different cache types
     */
    public async getCacheStats() {
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
    public async clearCache(type: CacheType | CacheTypeAll = 'all') {
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
}
