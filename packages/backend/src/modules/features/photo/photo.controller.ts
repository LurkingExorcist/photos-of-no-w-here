import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

import { PhotoService } from './photo.service';

/**
 * Controller responsible for handling photo-related operations
 * Provides endpoints for retrieving photos based on their color values
 */
@Controller('photo')
export class PhotoController {
    constructor(private readonly photoService: PhotoService) {}

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
    public async getPhoto(
        @Res() response: Response,
        @Param('color') colorHex: string
    ) {
        const photoPath = await this.photoService.getPhotoPath(colorHex);

        if (!photoPath) {
            throw new NotFoundException('Photo not found');
        }

        response.sendFile(photoPath);
    }
}
