import { parentPort, workerData } from 'worker_threads';

import { Redis } from 'ioredis';

import { prefixColor } from '../cache/prefixer.utils';

import {
    calculateWorkerSpectrum,
    findClosestMedia,
    rgbToHex,
    rgbToHsl,
} from './color-processor.utils';

import type {
    MediaColorProcessorData,
    RedisConfig,
} from './color-processor.types';
import type { Media } from '../data/data.types';

if (!parentPort) {
    throw new Error('parentPort is null');
}

const { medias, threadCount, workerIndex, redisConfig } =
    workerData as MediaColorProcessorData & { redisConfig: RedisConfig };

const redis = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
});

// Safe wrapper for parentPort.postMessage that checks for null
const postMessage = (message: string): void => {
    if (parentPort) {
        parentPort.postMessage(message);
    }
};

/**
 * Process colors within the worker's spectrum and cache the results
 */
async function processColorSpectrum(params: {
    threadCount: number;
    workerIndex: number;
    medias: Media[];
    redis: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<void>;
    };
    prefixColor: (color: string) => string;
    logMessage: (message: string) => void;
}): Promise<void> {
    const { threadCount, workerIndex, medias, redis, prefixColor, logMessage } =
        params;
    const [spectrumStart, spectrumEnd] = calculateWorkerSpectrum(
        threadCount,
        workerIndex
    );

    logMessage(
        `Worker #${workerIndex} is initialized to process a spectrum part of [${spectrumStart}, ${spectrumEnd}]`
    );

    for (let red = spectrumStart; red < spectrumEnd; red++) {
        for (let green = 0; green < 256; green++) {
            for (let blue = 0; blue < 256; blue++) {
                const colorHex = rgbToHex(red, green, blue);
                const cacheKey = prefixColor(colorHex);

                if (await redis.get(cacheKey)) {
                    logMessage(
                        `Worker #${workerIndex}: color #${colorHex} is already cached`
                    );
                    continue;
                }

                const closestMedia = findClosestMedia(
                    medias,
                    rgbToHsl(red, green, blue, 1),
                    workerIndex,
                    logMessage
                );

                if (!closestMedia) {
                    logMessage(
                        `Worker #${workerIndex}: no closest media found`
                    );
                    return;
                }

                await redis.set(cacheKey, closestMedia.uri);
            }
        }
    }

    logMessage(
        `Worker #${workerIndex} is finished processing a spectrum part of [${spectrumStart}, ${spectrumEnd}]`
    );
}

// Main execution
(async () => {
    try {
        await processColorSpectrum({
            threadCount,
            workerIndex,
            medias,
            redis: {
                get: redis.get.bind(redis),
                set: async (key, value) => {
                    await redis.set(key, value);
                    return undefined;
                },
            },
            prefixColor,
            logMessage: postMessage,
        });
    } catch (error) {
        postMessage(
            `Worker #${workerIndex} has failed. Reason: ${error instanceof Error ? error.message : String(error)}`
        );
    } finally {
        if (parentPort) {
            parentPort.close();
        }
        await redis.quit();
    }
})();
