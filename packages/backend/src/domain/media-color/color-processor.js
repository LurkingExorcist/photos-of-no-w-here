// @ts-check
const { join } = require('path');
const { workerData, parentPort } = require('worker_threads');

const { Redis } = require('ioredis');

/**
 * Resolve a path from the root of the project
 * @param {string} path - The path to resolve
 * @returns {string} The resolved path
 */
const resolveFromRoot = (path) =>
    join(
        process.cwd(),
        process.env.NODE_ENV === 'development' ? 'dist/src' : 'src',
        path
    );

const { prefixColor } = require(resolveFromRoot('domain/cache/prefixer.utils'));

if (!parentPort) {
    throw new Error('parentPort is null');
}

/**
 * @typedef {import('./color-processor.types').MediaColorProcessorData} MediaColorProcessorData
 * @typedef {import('./color-processor.types').RedisConfig} RedisConfig
 * @typedef {import('../data/data.types').Media} Media
 */

/**
 * @typedef {Object} ColorMatch
 * @property {Media | null} media - The matched media
 * @property {number} hueDiff - Hue difference
 * @property {number} lightnessDiff - Lightness difference
 * @property {number} saturationDiff - Saturation difference
 */

// Default precision for color component comparison
const DEFAULT_PRECISION = 0.01;

/** @type {MediaColorProcessorData & { redisConfig: RedisConfig }} */
const { medias, threadCount, workerIndex, redisConfig } = workerData;

const redis = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
});

// Safe wrapper for parentPort.postMessage that checks for null
const postMessage = (message) => {
    if (parentPort) {
        parentPort.postMessage(message);
    }
};

/**
 * Calculate the spectrum range for the current worker
 * @returns {[number, number]} Start and end values for the red spectrum
 */
const calculateWorkerSpectrum = () => {
    const start = Math.floor((256 / threadCount) * workerIndex);
    const end = Math.floor((256 / threadCount) * (workerIndex + 1));
    return [start, end];
};

/**
 * Check if two numbers are equal within the specified precision
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} precision - Precision threshold
 * @returns {boolean} True if numbers are equal within precision
 */
const isEqualWithPrecision = (a, b, precision = DEFAULT_PRECISION) => {
    return Math.abs(a - b) <= precision;
};

/**
 * Calculate the minimum hue difference considering the circular nature of hue
 * @param {number} hue1 - First hue value [0, 1]
 * @param {number} hue2 - Second hue value [0, 1]
 * @returns {number} Minimum difference between hues
 */
const calculateHueDifference = (hue1, hue2) => {
    return Math.min(
        Math.abs(hue1 - hue2),
        Math.abs(1 + hue1 - hue2),
        Math.abs(hue1 - (1 + hue2))
    );
};

/**
 * Find the closest media by color using prioritized HSL matching
 * @param {Media[]} mediaList - List of media to search through
 * @returns {Media | null} The closest matching media or null if none found
 */
const findClosestMedia = (mediaList) => {
    /** @type {ColorMatch} */
    let bestMatch = {
        media: null,
        hueDiff: Infinity,
        lightnessDiff: Infinity,
        saturationDiff: Infinity,
    };

    let referenceColor = {
        hue: 0,
        lightness: 0,
        saturation: 0,
    };

    for (const currentMedia of mediaList) {
        if (!currentMedia.average_color_hsl) {
            postMessage(
                `Worker #${workerIndex}: no color found for ${currentMedia.uri}`
            );
            continue;
        }

        const [hue, saturation, lightness] = currentMedia.average_color_hsl;
        const hueDiff = calculateHueDifference(hue, referenceColor.hue);

        // Primary priority: Hue
        if (hueDiff < bestMatch.hueDiff) {
            bestMatch = {
                media: currentMedia,
                hueDiff,
                lightnessDiff: Infinity,
                saturationDiff: Infinity,
            };
            referenceColor = { hue, saturation, lightness };
            continue;
        }

        // Check if hues are equal within precision
        if (isEqualWithPrecision(hueDiff, bestMatch.hueDiff)) {
            const lightnessDiff = Math.abs(
                lightness - referenceColor.lightness
            );

            if (lightnessDiff < bestMatch.lightnessDiff) {
                bestMatch = {
                    media: currentMedia,
                    hueDiff,
                    lightnessDiff,
                    saturationDiff: Infinity,
                };
                referenceColor = { hue, saturation, lightness };
                continue;
            }

            // Check if lightness values are equal within precision
            if (isEqualWithPrecision(lightnessDiff, bestMatch.lightnessDiff)) {
                const saturationDiff = Math.abs(
                    saturation - referenceColor.saturation
                );

                // Update only if saturation difference is smaller
                if (saturationDiff < bestMatch.saturationDiff) {
                    bestMatch = {
                        media: currentMedia,
                        hueDiff,
                        lightnessDiff,
                        saturationDiff,
                    };
                    referenceColor = { hue, saturation, lightness };
                }
            }
        }
    }

    return bestMatch.media;
};

/**
 * Convert RGB values to hexadecimal color string
 * @param {number} red - Red value [0, 255]
 * @param {number} green - Green value [0, 255]
 * @param {number} blue - Blue value [0, 255]
 * @returns {string} Hexadecimal color string
 */
const rgbToHex = (red, green, blue) => {
    return [red, green, blue]
        .map((val) => val.toString(16).padStart(2, '0'))
        .join('');
};

/**
 * Process colors within the worker's spectrum and cache the results
 */
const processColorSpectrum = async () => {
    const [spectrumStart, spectrumEnd] = calculateWorkerSpectrum();

    postMessage(
        `Worker #${workerIndex} is initialized to process a spectrum part of [${spectrumStart}, ${spectrumEnd}]`
    );

    for (let red = spectrumStart; red < spectrumEnd; red++) {
        for (let green = 0; green < 256; green++) {
            for (let blue = 0; blue < 256; blue++) {
                const colorHex = rgbToHex(red, green, blue);
                const cacheKey = prefixColor(colorHex);

                if (await redis.get(cacheKey)) {
                    postMessage(
                        `Worker #${workerIndex}: color #${colorHex} is already cached`
                    );
                    continue;
                }

                const closestMedia = findClosestMedia(medias);

                if (!closestMedia) {
                    postMessage(
                        `Worker #${workerIndex}: no closest media found`
                    );
                    return;
                }

                await redis.set(cacheKey, closestMedia.uri);
            }
        }
    }

    postMessage(
        `Worker #${workerIndex} is finished processing a spectrum part of [${spectrumStart}, ${spectrumEnd}]`
    );
};

// Main execution
(async () => {
    try {
        await processColorSpectrum();
    } catch (error) {
        postMessage(
            `Worker #${workerIndex} has failed. Reason: ${error.message}`
        );
    } finally {
        if (parentPort) {
            parentPort.close();
        }
        await redis.quit();
    }
})();
