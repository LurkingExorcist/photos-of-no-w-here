import { join } from 'path';
import { Worker } from 'worker_threads';

import { Injectable, Logger } from '@nestjs/common';
import { getAverageColor } from 'fast-average-color-node';

import { ConfigService } from '@/domain/config/config.service';

import { MediaColorProcessorData } from './color-processor.types';
import { HSLColor, HexColor, RGBAColor } from './media-color.types';
import { convertRgbToHsl } from './media-color.utils';

@Injectable()
export class MediaColorService {
    private readonly logger = new Logger(MediaColorService.name);

    constructor(private readonly configService: ConfigService) {}

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
    public async processMediasToColors(
        options: MediaColorProcessorData
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const worker = this.createWorker(options);

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

    private createWorker(options: MediaColorProcessorData) {
        const workerPath =
            process.env.NODE_ENV === 'development'
                ? join(
                      process.cwd(),
                      'src/domain/media-color/color-processor.js'
                  )
                : join(
                      process.cwd(),
                      'dist/src/domain/media-color/color-processor.js'
                  );

        const worker = new Worker(workerPath, {
            workerData: {
                ...options,
                redisConfig: {
                    host: this.configService.redisHost,
                    port: this.configService.redisPort,
                },
            },
            env: {
                NODE_ENV: process.env.NODE_ENV || 'development',
            },
        });
        return worker;
    }

    private convertRgbToHsl(...color: RGBAColor): HSLColor {
        return convertRgbToHsl(...color);
    }
}
