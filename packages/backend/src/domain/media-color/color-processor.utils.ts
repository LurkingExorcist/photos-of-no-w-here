import type { HSLColor, HexColor, RGBAColor } from './media-color.types';
import type { Media } from '../data/data.types';

/**
 * Calculates the lightness component of an HSL color
 * Lightness is the average of the highest and lowest RGB values
 */
function calculateLightness(max: number, min: number): number {
    return (max + min) / 2;
}

/**
 * Calculates the saturation component of an HSL color
 * Saturation represents the color intensity and varies based on lightness
 */
function calculateSaturation(
    max: number,
    min: number,
    lightness: number
): number {
    if (max === min) return 0; // achromatic case

    const delta = max - min;
    return lightness > 0.5
        ? delta / (2 - max - min) // formula for lighter colors
        : delta / (max + min); // formula for darker colors
}

/**
 * Calculates the hue component of an HSL color
 * Hue represents the base color and is calculated differently depending on which RGB component is highest
 */
function calculateHue(
    r: number,
    g: number,
    b: number,
    max: number,
    min: number
): number {
    if (max === min) return 0; // achromatic case

    const delta = max - min;
    let hue: number;

    switch (max) {
        case r:
            // Red is highest - hue between yellow & magenta
            hue = (g - b) / delta + (g < b ? 6 : 0);
            break;
        case g:
            // Green is highest - hue between cyan & yellow
            hue = (b - r) / delta + 2;
            break;
        case b:
            // Blue is highest - hue between magenta & cyan
            hue = (r - g) / delta + 4;
            break;
        default:
            throw new Error('Invalid maximum RGB value');
    }

    // Convert to the range [0, 1]
    return hue / 6;
}

/**
 * Converts an RGB(A) color to HSL color space
 *
 * @param color - RGB or RGBA color values in the range [0, 255]
 * @returns HSL color values where:
 *   - Hue is in the range [0, 1] (multiply by 360 for degrees)
 *   - Saturation is in the range [0, 1]
 *   - Lightness is in the range [0, 1]
 */
export function rgbToHsl(...color: RGBAColor): HSLColor {
    const [r, g, b] = color;

    // Normalize RGB values to [0, 1] range
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    // Find the highest and lowest RGB values
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);

    // Calculate HSL components
    const lightness = calculateLightness(max, min);
    const saturation = calculateSaturation(max, min, lightness);
    const hue = calculateHue(rNorm, gNorm, bNorm, max, min);

    return [hue, saturation, lightness];
}

/**
 * Convert RGB values to hexadecimal color string
 * @param red - Red value [0, 255]
 * @param green - Green value [0, 255]
 * @param blue - Blue value [0, 255]
 * @returns Hexadecimal color string
 */
export function rgbToHex(red: number, green: number, blue: number): HexColor {
    return [red, green, blue]
        .map((val) => val.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Check if two numbers are equal within the specified precision
 * @param a - First number
 * @param b - Second number
 * @param precision - Precision threshold
 * @returns True if numbers are equal within precision
 */
export function isEqualWithPrecision(
    a: number,
    b: number,
    precision = 0.01
): boolean {
    return Math.abs(a - b) <= precision;
}

/**
 * Calculate the minimum hue difference considering the circular nature of hue
 * @param hue1 - First hue value [0, 1]
 * @param hue2 - Second hue value [0, 1]
 * @returns Minimum difference between hues
 */
export function calculateHueDifference(hue1: number, hue2: number): number {
    return Math.min(
        Math.abs(hue1 - hue2),
        Math.abs(1 + hue1 - hue2),
        Math.abs(hue1 - (1 + hue2))
    );
}

/**
 * Calculate the spectrum range for a worker
 * @param threadCount - Total number of threads
 * @param workerIndex - Current worker index
 * @returns Start and end values for the red spectrum
 */
export function calculateWorkerSpectrum(
    threadCount: number,
    workerIndex: number
): [number, number] {
    const start = Math.floor((256 / threadCount) * workerIndex);
    const end = Math.floor((256 / threadCount) * (workerIndex + 1));
    return [start, end];
}

/**
 * Interface for color matching results
 */
export interface ColorMatch {
    media: Media | null;
    hueDiff: number;
    lightnessDiff: number;
    saturationDiff: number;
}

/**
 * Find the closest media by color using prioritized HSL matching
 * @param mediaList - List of media to search through
 * @param targetColor - Target HSL color to match against
 * @param workerIndex - Current worker index for logging
 * @param logMessage - Function to log messages
 * @returns The closest matching media or null if none found
 */
export function findClosestMedia(
    mediaList: Media[],
    targetColor: HSLColor,
    workerIndex: number,
    logMessage: (message: string) => void
): Media | null {
    let bestMatch: ColorMatch = {
        media: null,
        hueDiff: Infinity,
        lightnessDiff: Infinity,
        saturationDiff: Infinity,
    };

    // Weights for color components (hue is most important)
    const HUE_WEIGHT = 0.6;
    const SATURATION_WEIGHT = 0.2;
    const LIGHTNESS_WEIGHT = 0.4;

    let bestTotalDiff = Infinity;

    for (const currentMedia of mediaList) {
        if (!currentMedia.average_color_hsl) {
            logMessage(
                `Worker #${workerIndex}: no color found for ${currentMedia.uri}`
            );
            continue;
        }

        const [hue, saturation, lightness] = currentMedia.average_color_hsl;

        // Calculate differences for each component
        const hueDiff = calculateHueDifference(hue, targetColor[0]);
        const saturationDiff = Math.abs(saturation - targetColor[1]);
        const lightnessDiff = Math.abs(lightness - targetColor[2]);

        // Calculate weighted total difference
        const totalDiff =
            hueDiff * HUE_WEIGHT +
            saturationDiff * SATURATION_WEIGHT +
            lightnessDiff * LIGHTNESS_WEIGHT;

        // Update best match if we found a better total difference
        if (totalDiff < bestTotalDiff) {
            bestTotalDiff = totalDiff;
            bestMatch = {
                media: currentMedia,
                hueDiff,
                saturationDiff,
                lightnessDiff,
            };
        }
    }

    return bestMatch.media;
}
