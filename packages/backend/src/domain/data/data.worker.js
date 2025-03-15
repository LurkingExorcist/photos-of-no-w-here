// @ts-check
import { workerData, parentPort } from 'worker_threads';
import Redis from 'ioredis';

if (!parentPort) {
    throw new Error('parentPort is null');
}

const cache = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port:
        (process.env.REDIS_PORT && parseInt(process.env.REDIS_PORT, 10)) ||
        6379,
});

/**
 * @type {import('./data.interface').WorkerData}
 */
const { medias, threadCount, workerIndex } = workerData;

const redSpectrum = [
    (256 / threadCount) * workerIndex,
    (256 / threadCount) * (workerIndex + 1),
];

parentPort.postMessage(
    `Worker #${workerIndex} is initialized to process a spectrum part of [${redSpectrum[0]}, ${redSpectrum[1]}]`
);

for (let red = redSpectrum[0]; red < redSpectrum[1]; red++) {
    for (let green = 0; green < 256; green++) {
        for (let blue = 0; blue < 256; blue++) {
            const color =
                '#' +
                [red, green, blue]
                    .map((val) => val.toString(16).padStart(2, '0'))
                    .join('');

            /**
             * @type {import('./data.interface').Media | null}
             */
            let closestMedia = null;
            /**
             * @type {[number, number, number]}
             */
            let closestMediaDiff = [255, 255, 255];

            for (const currentMedia of medias) {
                const color = currentMedia.average_color_raw;
                if (!color) {
                    parentPort.postMessage(
                        `Worker #${workerIndex}: no color found for ${currentMedia.uri}`
                    );
                    continue;
                }

                /**
                 * @type {[number, number, number]}
                 */
                const currentDiff = [
                    Math.abs(red - color[0]),
                    Math.abs(green - color[1]),
                    Math.abs(blue - color[2]),
                ];
                if (
                    currentDiff[0] < closestMediaDiff[0] &&
                    currentDiff[1] < closestMediaDiff[1] &&
                    currentDiff[2] < closestMediaDiff[2]
                ) {
                    closestMedia = currentMedia;
                    closestMediaDiff = currentDiff;
                }
            }

            if (!closestMedia) {
                parentPort.postMessage(
                    `Worker #${workerIndex}: no closest media found`
                );
                break;
            }

            cache.set(color, closestMedia.uri);
        }
    }
}

parentPort.postMessage(
    `Worker #${workerIndex} is finished processing a spectrum part of [${redSpectrum[0]}, ${redSpectrum[1]}]`
);

parentPort.close();
