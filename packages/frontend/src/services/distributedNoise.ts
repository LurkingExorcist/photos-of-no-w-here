import { Random } from 'random';

import type { INoiseGenerator } from '@/types/noise';

/**
 * Implements a noise generator that produces normally distributed random values.
 * This generator ignores the input coordinates and returns values from a normal distribution.
 */
export class DistributedNoise implements INoiseGenerator {
    private readonly random: Random;
    private readonly normalDistribution: () => number;

    /**
     * Creates a new distributed noise generator with the specified random seed.
     * @param seed - The random seed to use for deterministic noise generation
     */
    constructor(seed: number) {
        this.random = new Random(seed);
        this.normalDistribution = this.random.normal(0, 1);
    }

    /**
     * Generates a random value from a normal distribution.
     * Note: This implementation ignores the input coordinates.
     * @param _x - X coordinate (unused in this implementation)
     * @param _y - Y coordinate (unused in this implementation)
     * @param _z - Z coordinate (unused in this implementation)
     * @returns A noise value in the approximate range [-1, 1]
     */
    public noise(_x: number, _y: number, _z: number): number {
        const value = this.normalDistribution();
        return value;
    }
}
