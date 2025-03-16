import type { CacheType } from '@/external/redis/types';

/**
 * Adds a type prefix to a cache key
 * @param type - The type of cache (color or media)
 * @param value - The value to prefix
 * @returns Prefixed cache key
 */
export const prefix = (type: CacheType, value: string) => `${type}:${value}`;

/**
 * Creates a color-prefixed cache key
 * @param value - The color value to prefix
 * @returns Color-prefixed cache key
 */
export const prefixColor = (value: string) => prefix('color', value);

/**
 * Creates a media-prefixed cache key
 * @param value - The media identifier to prefix
 * @returns Media-prefixed cache key
 */
export const prefixMedia = (value: string) => prefix('media', value);

/**
 * Removes the type prefix from a cache key
 * @param key - The prefixed cache key
 * @returns Original value without prefix
 */
export const unprefix = (key: string) => key.split(':')[1];
