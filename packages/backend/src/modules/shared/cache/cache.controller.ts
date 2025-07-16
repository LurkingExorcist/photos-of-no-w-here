import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CacheType, CacheTypeAll } from '@/modules/shared/cache/cache.types';

import { CacheService } from './cache.service';

/**
 * Controller for managing the cache operations
 */
@ApiTags('Cache Management')
@Controller('cache')
export class CacheController {
    constructor(private readonly cacheService: CacheService) {}

    /**
     * Get the current cache statistics
     * @returns Promise resolving to the cache statistics
     */
    @ApiOperation({ summary: 'Get current cache statistics' })
    @Get('stats')
    public async getCacheStats() {
        return this.cacheService.getCacheStats();
    }

    /**
     * Clear the cache for the given type
     * @param type - The type of cache to clear (optional)
     * @returns Promise resolving to the clearing result
     */
    @ApiOperation({ summary: 'Clear the cache for the given type' })
    @ApiQuery({
        name: 'type',
        type: 'enum',
        enum: ['all', 'color', 'media'] satisfies (CacheType | CacheTypeAll)[],
        required: false,
        description: 'The type of cache to clear (optional)',
    })
    @Post('clear')
    public async clearCache(@Query('type') type?: CacheType | CacheTypeAll) {
        return this.cacheService.clearCache(type);
    }

    /**
     * Get a slice of cache entries for a specific type
     * @param type - The type of cache to get entries from
     * @param start - Starting index (0-based)
     * @param count - Number of entries to return
     * @returns Promise resolving to an array of cache entries
     */
    @ApiOperation({
        summary: 'Get a slice of cache entries for a specific type',
    })
    @ApiQuery({
        name: 'type',
        type: 'enum',
        enum: ['color', 'media'] satisfies CacheType[],
        required: true,
        description: 'The type of cache to get entries from',
    })
    @ApiQuery({
        name: 'start',
        type: 'number',
        required: false,
        description: 'Starting index (0-based)',
    })
    @ApiQuery({
        name: 'count',
        type: 'number',
        required: false,
        description: 'Number of entries to return',
    })
    @Get('slice')
    public async getCacheSlice(
        @Query('type') type: CacheType,
        @Query('start') start?: number,
        @Query('count') count?: number
    ) {
        return this.cacheService.getCacheSlice(type, start, count);
    }
}
