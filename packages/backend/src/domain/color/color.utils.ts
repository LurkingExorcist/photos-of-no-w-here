import { HSLColor, RGBAColor } from './types';

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
export function convertRgbToHsl(...color: RGBAColor): HSLColor {
    const [r, g, b] = color;

    // Find the highest and lowest RGB values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Calculate HSL components
    const lightness = calculateLightness(max, min);
    const saturation = calculateSaturation(max, min, lightness);
    const hue = calculateHue(r, g, b, max, min);

    return [hue, saturation, lightness];
}

/**
 * Calculates the color difference between two RGB(A) colors
 * Uses the Euclidean distance in RGB space
 * @param color1 - First RGB color
 * @param color2 - Second RGB color
 * @returns Array of color differences for each component
 */
export function calculateColorDifference(
    color1: RGBAColor,
    color2: RGBAColor
): RGBAColor {
    return [
        Math.abs(color1[0] - color2[0]),
        Math.abs(color1[1] - color2[1]),
        Math.abs(color1[2] - color2[2]),
        Math.abs(color1[3] - color2[3]),
    ];
}

/**
 * Determines if the first color difference is closer to the target color
 * @param diff1 - First color difference
 * @param diff2 - Second color difference
 * @returns True if diff1 is closer, false otherwise
 */
export function isCloserColor(diff1: RGBAColor, diff2: RGBAColor): boolean {
    return diff1[0] < diff2[0] && diff1[1] < diff2[1] && diff1[2] < diff2[2];
}
