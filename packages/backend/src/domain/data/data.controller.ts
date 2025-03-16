import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DataService } from './data.service';

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
    public async uploadFile(@UploadedFile() archive: Express.Multer.File) {
        return this.dataService.upload(archive);
    }
}
