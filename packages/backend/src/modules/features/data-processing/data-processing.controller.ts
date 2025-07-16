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

import { DataProcessingService } from './data-processing.service';
import { Media, PaginatedResponse } from './data-processing.types';

@ApiTags('Data Management')
@Controller('data')
export class DataProcessingController {
    constructor(private readonly dataProcessingService: DataProcessingService) {}

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
        return this.dataProcessingService.upload(archive);
    }

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
        return this.dataProcessingService.queryMedia({
            page,
            limit,
            startDate,
            endDate,
            title,
            uri,
        });
    }
} 