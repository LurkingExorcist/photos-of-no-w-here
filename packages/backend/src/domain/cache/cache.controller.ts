import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CacheType, CacheTypeAll } from '@/external/redis/types';

import { Media } from '../data/types';

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
     * Verify and update the cache for the given media items
     * @param medias - Array of media items to verify and update
     * @returns Promise resolving to the verification result
     */
    @ApiOperation({
        summary: 'Verify and update the cache for the given media items',
    })
    @Post('verify')
    public async verifyCache(@Body() { medias }: { medias: Media[] }) {
        return this.cacheService.verifyCache(medias);
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
}
