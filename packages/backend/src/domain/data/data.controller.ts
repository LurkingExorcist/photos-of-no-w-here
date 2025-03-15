import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { DataService } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('data')
export class DataController {
    constructor(private readonly dataService: DataService) {}

    @Post('upload')
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
    uploadFile(@UploadedFile() archive: Express.Multer.File) {
        this.dataService.upload(archive);
    }

    @Post('verify-cache')
    verifyCache() {
        this.dataService.verifyCache();
    }
}
