import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { RedisService } from '@/external/redis/redis.service';
import { PrefixerService } from '@/external/redis/prefixer.service';
import { ApiParam, ApiOperation } from '@nestjs/swagger';

/**
 * Controller responsible for handling photo-related operations
 * Provides endpoints for retrieving photos based on their color values
 */
@Controller('photo')
export class PhotoController {
    constructor(
        private readonly redis: RedisService,
        private readonly prefixer: PrefixerService
    ) {}

    /**
     * Retrieves a photo by its color hex value
     * Searches the cache for a photo matching the specified color and serves it
     * @param response - Express response object to send the file
     * @param colorHex - Hex color value to search for (without #)
     * @throws NotFoundException when no photo matches the color
     */
    @Get('/:color')
    @ApiOperation({ summary: 'Get photo by color' })
    @ApiParam({ name: 'color', description: 'Hex color value (without #)' })
    async getPhoto(
        @Res() response: Response,
        @Param('color') colorHex: string
    ) {
        const cacheKey = this.prefixer.color(colorHex);
        const photoPath = await this.redis.get(cacheKey);

        if (!photoPath) {
            throw new NotFoundException('Photo not found');
        }

        response.sendFile(photoPath);
    }
}
