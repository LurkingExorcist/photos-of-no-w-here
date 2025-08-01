import { useCallback } from 'react';

import { RandomNoise, PerlinNoise } from '@/services';
import type { Chunk, GridCellDatum } from '@/types/grid';
import { generateGridCell } from '@/utils/chunk';

/**
 * Props for the useChunkGeneration hook
 */
interface UseChunkGenerationProps {
    /** Size of each chunk in grid cells */
    chunkSize: number;
}

/**
 * Return type for the useChunkGeneration hook
 */
interface ChunkGenerationResult {
    /** Generates a grid of cells for a chunk */
    generateChunk: (chunkX: number, chunkY: number) => GridCellDatum[][];
    /** Creates a complete chunk with coordinates and cells */
    createChunk: (x: number, y: number) => Chunk;
}

// Initialize Perlin noise generators with random seeds
const saturationNoise = new RandomNoise();
const lightnessNoise = new PerlinNoise(Math.random() * 1000);

/**
 * Hook for generating colorful grid chunks using Perlin noise
 *
 * Uses Perlin noise to create smooth transitions in colors across the grid
 *
 * @param props - Configuration for chunk generation
 * @returns Functions for generating chunks and cells
 */
export const useChunkGeneration = ({
    chunkSize,
}: UseChunkGenerationProps): ChunkGenerationResult => {
    /**
     * Generates a full chunk of grid cells
     */
    const generateChunk = useCallback(
        (chunkX: number, chunkY: number): GridCellDatum[][] => {
            const newChunk: GridCellDatum[][] = [];

            for (let y = 0; y < chunkSize; y++) {
                newChunk[y] = [];
                for (let x = 0; x < chunkSize; x++) {
                    // Calculate global position
                    const globalX = chunkX * chunkSize + x;
                    const globalY = chunkY * chunkSize + y;

                    // Use our utility function to generate a cell
                    newChunk[y][x] = generateGridCell(
                        globalX,
                        globalY,
                        saturationNoise,
                        lightnessNoise
                    );
                }
            }

            return newChunk;
        },
        [chunkSize]
    );

    /**
     * Creates a new chunk with specified coordinates
     */
    const createChunk = useCallback(
        (x: number, y: number): Chunk => {
            return {
                x,
                y,
                cells: generateChunk(x, y),
            };
        },
        [generateChunk]
    );

    return {
        generateChunk,
        createChunk,
    };
};
