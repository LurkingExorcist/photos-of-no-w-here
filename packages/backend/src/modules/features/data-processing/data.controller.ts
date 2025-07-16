import {
    Controller,
    Get,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { DataProcessingService } from '@/modules/features/data-processing/data-processing.service';
import { Media, PaginatedResponse } from '@/modules/features/data-processing/data-processing.types';

/**
 * Controller responsible for managing data operations including file uploads and cache management
 * Provides endpoints for uploading Instagram data archives, managing cache, and retrieving statistics
 */
@ApiTags('Data Management')
@Controller('data')
export class DataController {
    constructor(private readonly dataService: DataProcessingService) {}

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
    public async uploadFile(@UploadedFile() archive: Express.Multer.File) {
        return this.dataService.upload(archive);
    }

    /**
     * Retrieves media items with optional filtering and pagination
     * @param page - The page number (1-based)
     * @param limit - Number of items per page
     * @param startDate - Filter media created after this timestamp
     * @param endDate - Filter media created before this timestamp
     * @param title - Filter media by title (case-insensitive partial match)
     * @param uri - Filter media by URI (case-insensitive partial match)
     * @returns Promise resolving to paginated media items
     */
    @Get('media')
    @ApiOperation({ summary: 'Get media items with filtering and pagination' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (1-based)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: Number,
        description: 'Filter media created after this timestamp',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: Number,
        description: 'Filter media created before this timestamp',
    })
    @ApiQuery({
        name: 'title',
        required: false,
        type: String,
        description: 'Filter media by title (case-insensitive partial match)',
    })
    @ApiQuery({
        name: 'uri',
        required: false,
        type: String,
        description: 'Filter media by URI (case-insensitive partial match)',
    })
    @ApiResponse({
        status: 200,
        description: 'Returns paginated media items',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Media' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    })
    public async queryMedia(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('startDate') startDate?: number,
        @Query('endDate') endDate?: number,
        @Query('title') title?: string,
        @Query('uri') uri?: string
    ): Promise<PaginatedResponse<Media>> {
        return this.dataService.queryMedia({
            page,
            limit,
            startDate,
            endDate,
            title,
            uri,
        });
    }
}
