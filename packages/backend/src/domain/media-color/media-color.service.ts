import { Injectable, Logger } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { join } from 'path';
import { ConfigService } from '@/config/config.service';
import { Media } from '../data/types';
import { getAverageColor } from 'fast-average-color-node';
import { HSLColor, HexColor, RGBAColor } from './media-color.types';
import { convertRgbToHsl } from './media-color.utils';

@Injectable()
export class MediaColorService {
    private readonly logger = new Logger(MediaColorService.name);

    constructor(private readonly configService: ConfigService) {}

    private convertRgbToHsl(...color: RGBAColor): HSLColor {
        return convertRgbToHsl(...color);
    }

    /**
     * Calculates and sets the average color for a media item
     * @param imagePath - The path to the image to process
     * @returns The updated media item with color information
     */
    public async calculateMediaColor(
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

    /**
     * Process media items to generate and cache color matches
     * @param options Configuration for the worker thread
     */
    public async processMediasToColors(options: {
        medias: Media[];
        threadCount: number;
        workerIndex: number;
    }): Promise<void> {
        return new Promise((resolve, reject) => {
            const worker = new Worker(join(__dirname, 'color-processor.js'), {
                workerData: {
                    ...options,
                    redisConfig: {
                        host: this.configService.redisHost,
                        port: this.configService.redisPort,
                    },
                },
            });

            worker.on('message', (message: string) => {
                this.logger.log(message);
            });

            worker.on('error', (error: Error) => {
                this.logger.error(`Worker error: ${error.message}`);
                reject(error);
            });

            worker.on('exit', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                } else {
                    resolve();
                }
            });
        });
    }
}
