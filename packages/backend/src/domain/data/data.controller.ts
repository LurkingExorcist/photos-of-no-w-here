import {
    Controller,
    Post,
    Get,
    Delete,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { DataService } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBody,
    ApiConsumes,
    ApiQuery,
    ApiTags,
    ApiOperation,
} from '@nestjs/swagger';
import { CacheTypeAll } from '@/external/redis/types';
import { CacheType } from '@/external/redis/types';

/**
 * Controller responsible for managing data operations including file uploads and cache management
 * Provides endpoints for uploading Instagram data archives, managing cache, and retrieving statistics
 */
@ApiTags('Data Management')
@Controller('data')
export class DataController {
    constructor(private readonly dataService: DataService) {}

    /**
     * Handles the upload of Instagram data archives
     * Processes the uploaded ZIP file and extracts media content
     * @param archive - The uploaded file containing Instagram data
     * @returns Promise resolving to the processing result
     */
    @Post('upload')
    @ApiOperation({ summary: 'Upload Instagram data archive' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                archive: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('archive'))
    async uploadFile(@UploadedFile() archive: Express.Multer.File) {
        return this.dataService.upload(archive);
    }

    /**
     * Verifies and rebuilds the color cache for all media
     * Processes all media files to ensure their color information is cached
     * @returns Promise resolving when cache verification is complete
     */
    @Post('verify-cache')
    @ApiOperation({ summary: 'Verify and rebuild color cache' })
    async verifyCache() {
        return this.dataService
            .getProcessedMedias()
            .then((medias) => this.dataService.verifyCache(medias));
    }

    /**
     * Clears specified type of cache or all cache entries
     * @param type - The type of cache to clear ('color', 'media', or 'all')
     * @returns Promise resolving to the cache clearing result
     */
    @Delete('cache')
    @ApiOperation({ summary: 'Clear cache by type' })
    @ApiQuery({
        name: 'type',
        enum: ['color', 'media', 'all'] satisfies Array<
            CacheType | CacheTypeAll
        >,
        description: 'Type of cache to clear',
        required: false,
    })
    async clearCache(@Query('type') type: CacheType | CacheTypeAll = 'all') {
        return this.dataService.clearCache(type);
    }

    /**
     * Retrieves statistics about the current cache state
     * Returns counts of different types of cached items
     * @returns Promise resolving to cache statistics
     */
    @Get('cache/stats')
    @ApiOperation({ summary: 'Get cache statistics' })
    async getCacheStats() {
        return this.dataService.getCacheStats();
    }
}
