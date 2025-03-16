import { Injectable, Logger } from '@nestjs/common';
import { getAverageColor } from 'fast-average-color-node';
import { HSLColor, HexColor, RGBAColor } from './types';
import { convertRgbToHsl } from './color.utils';
@Injectable()
export class ColorService {
    constructor(private readonly logger: Logger) {}

    private convertRgbToHsl(...color: RGBAColor): HSLColor {
        return convertRgbToHsl(...color);
    }

    /**
     * Calculates and sets the average color for a media item
     * @param imagePath - The path to the image to process
     * @returns The updated media item with color information
     */
    public async processMediaColor(
        imagePath: string
    ): Promise<{ hex: HexColor; rgba: RGBAColor; hsl: HSLColor }> {
        try {
            const color = await getAverageColor(imagePath);

            return {
                hex: color.hex,
                rgba: color.value,
                hsl: this.convertRgbToHsl(...color.value),
            };
        } catch (error) {
            this.logger.error(
                `Error processing color for image ${imagePath}: ${error.message}`
            );
            throw error;
        }
    }
}
