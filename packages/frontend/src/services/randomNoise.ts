import type { INoiseGenerator } from '@/types/noise';

/**
 * Implements a noise generator that produces random values.
 * This generator ignores the input coordinates and returns values from a random distribution.
 */
export class RandomNoise implements INoiseGenerator {
    /**
     * Generates a random value from a random distribution.
     * Note: This implementation ignores the input coordinates.
     * @param _x - X coordinate (unused in this implementation)
     * @param _y - Y coordinate (unused in this implementation)
     * @param _z - Z coordinate (unused in this implementation)
     * @returns A noise value in the approximate range [-1, 1]
     */
    public noise(_x: number, _y: number, _z: number): number {
        const value = Math.pow(Math.random() * 0.5, 2) * 2 - 1;
        return value;
    }
}
