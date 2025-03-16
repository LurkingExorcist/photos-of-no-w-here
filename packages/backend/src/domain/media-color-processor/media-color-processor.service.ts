import { Injectable, Logger } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { join } from 'path';
import { ConfigService } from '@/config/config.service';
import { Media } from '../data/types';

@Injectable()
export class MediaColorProcessorService {
    private readonly logger = new Logger(MediaColorProcessorService.name);

    constructor(private readonly configService: ConfigService) {}

    async processMediaToColors(options: {
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
