import chroma from 'chroma-js';

import type { ColorMetric } from '../types';

/**
 * Calculate color distance between two colors based on the specified metric.
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @param metric - Color metric to use (RGB or Lab)
 * @returns Distance between the colors
 */
export const getColorDistance = (
    color1: string,
    color2: string,
    metric: ColorMetric
): number => {
    try {
        const c1 = chroma(color1);
        const c2 = chroma(color2);

        if (metric === 'RGB') {
            // Use Euclidean distance in RGB space
            const [r1, g1, b1] = c1.rgb();
            const [r2, g2, b2] = c2.rgb();
            return Math.sqrt(
                Math.pow(r1 - r2, 2) +
                    Math.pow(g1 - g2, 2) +
                    Math.pow(b1 - b2, 2)
            );
        } else if (metric === 'Lab') {
            // Use Delta E distance in Lab color space
            return chroma.distance(c1, c2);
        }

        return 0;
    } catch (error) {
        console.error('Error calculating color distance:', error);
        return 0;
    }
};

/**
 * Generate random hex color.
 * @returns Random hex color
 */
export const getRandomColor = (): string => {
    return chroma.random().hex();
};

/**
 * Calculate a position for a photo based on its color.
 * This is a simple mapping function that positions colors in a 2D space.
 * @param color - Hex color code
 * @returns {x, y} coordinates
 */
export const getColorPosition = (color: string): { x: number; y: number } => {
    try {
        const c = chroma(color);
        const [r, g, b] = c.rgb();

        // Using red and green channels for positioning
        // This is a simplified approach - you could use more complex mappings
        return {
            x: (r / 255) * 2000 - 1000, // Map to range -1000 to 1000
            y: (g / 255) * 2000 - 1000, // Map to range -1000 to 1000
        };
    } catch (error) {
        console.error('Error calculating color position:', error);
        return { x: 0, y: 0 };
    }
};
