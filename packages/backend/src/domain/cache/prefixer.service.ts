import { Injectable } from '@nestjs/common';
import { CacheType } from '@/external/redis/types';
import { prefix, prefixColor, prefixMedia, unprefix } from './prefixer.utils';

/**
 * Service for managing Redis key prefixes
 * Provides consistent key prefixing for different types of cached data
 */
@Injectable()
export class PrefixerService {
    /**
     * Adds a type prefix to a cache key
     * @param type - The type of cache (color or media)
     * @param value - The value to prefix
     * @returns Prefixed cache key
     */
    prefix(type: CacheType, value: string) {
        return prefix(type, value);
    }

    /**
     * Creates a color-prefixed cache key
     * @param value - The color value to prefix
     * @returns Color-prefixed cache key
     */
    color(value: string) {
        return prefixColor(value);
    }

    /**
     * Creates a media-prefixed cache key
     * @param value - The media identifier to prefix
     * @returns Media-prefixed cache key
     */
    media(value: string) {
        return prefixMedia(value);
    }

    /**
     * Removes the type prefix from a cache key
     * @param key - The prefixed cache key
     * @returns Original value without prefix
     */
    unprefix(key: string) {
        return unprefix(key);
    }
}
