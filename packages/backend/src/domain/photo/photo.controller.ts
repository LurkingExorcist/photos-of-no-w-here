import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { RedisService } from 'services/RedisService';

@Controller('photo')
export class PhotoController {
    constructor(private readonly cache: RedisService) {}

    @Get('/:color')
    async uploadFile(@Res() response: Response, @Param('color') color: string) {
        response.sendFile(await this.cache.get(color));
    }
}
