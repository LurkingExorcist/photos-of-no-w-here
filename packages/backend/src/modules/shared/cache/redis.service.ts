import { Injectable } from '@nestjs/common';
import Redis, { ChainableCommander } from 'ioredis';

import { ConfigService } from '@/modules/shared/config/config.service';

/**
 * Service for handling Redis cache operations
 * Provides a wrapper around Redis client with type-safe methods for common operations
 */
@Injectable()
export class RedisService {
    private client: Redis;

    constructor(private readonly configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.redisHost,
            port: this.configService.redisPort,
        });
    }

    /**
     * Sets a value in Redis cache
     * @param key - The cache key
     * @param value - The value to store
     */
    public async set(key: string, value: string): Promise<void> {
        await this.client.set(key, value);
    }

    /**
     * Retrieves a value from Redis cache
     * @param key - The cache key
     * @returns The cached value or null if not found
     */
    public async get(key: string): Promise<string> {
        return await this.client.get(key);
    }

    /**
     * Checks if a key exists in Redis cache
     * @param key - The cache key to check
     * @returns Boolean indicating if the key exists
     */
    public async has(key: string): Promise<boolean> {
        return (await this.client.exists(key)) > 0;
    }

    /**
     * Deletes a key from Redis cache
     * @param key - The cache key to delete
     */
    public async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    /**
     * Flushes all data from the Redis database
     */
    public async flushdb(): Promise<void> {
        await this.client.flushdb();
    }

    /**
     * Retrieves all keys matching a pattern
     * @param pattern - The pattern to match keys against
     * @returns Array of matching keys
     */
    public async keys(pattern: string): Promise<string[]> {
        return await this.client.keys(pattern);
    }

    /**
     * Deletes all keys matching a pattern
     * @param pattern - The pattern to match keys against
     */
    public async delKeys(pattern: string): Promise<void> {
        const keys = await this.keys(pattern);
        await this.client.del(...keys);
    }

    /**
     * Scans Redis database using cursor-based iteration
     * @param cursor - The cursor position to start from
     * @param pattern - Pattern to match keys against
     * @param count - Number of keys to return per iteration
     * @returns Tuple of next cursor and matching elements
     */
    public async scan(
        cursor: string,
        pattern: string,
        count: number
    ): Promise<[cursor: string, elements: string[]]> {
        return await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    }

    /**
     * Executes multiple Redis commands in a pipeline
     * @param commands - Array of functions that add commands to the pipeline
     */
    public async pipeline(
        commands: ((pipeline: ChainableCommander) => Promise<unknown>)[]
    ): Promise<void> {
        const pipeline = this.client.pipeline();
        for (const command of commands) {
            await command(pipeline);
        }
        await pipeline.exec();
    }
}
