import chroma from 'chroma-js';

import type { Chunk, GridCellDatum, GridPosition } from '@/types/grid';
import type { INoiseGenerator } from '@/types/noise';

/**
 * Represents grid coordinates for a chunk
 */
interface ChunkCoordinates {
    x: number;
    y: number;
}

/**
 * Calculates which chunks are visible in the current viewport
 *
 * @param position - Current grid position
 * @param scale - Current zoom scale
 * @param viewportRect - Dimensions of the viewport
 * @param chunkSize - Size of each chunk in cells
 * @param cellSize - Size of each cell in pixels
 * @returns Array of coordinates for visible chunks
 */
export const getVisibleChunkCoordinates = (
    position: GridPosition,
    scale: number,
    viewportRect: DOMRect,
    chunkSize: number,
    cellSize: number
): ChunkCoordinates[] => {
    const visibleChunkCoords: ChunkCoordinates[] = [];

    // Calculate visible area in grid coordinates with a smaller buffer
    const buffer = 0.5; // Half a viewport buffer
    const visibleLeft =
        (-position.x - viewportRect.width * buffer) / (cellSize * scale);
    const visibleRight =
        (-position.x + viewportRect.width * (1 + buffer)) / (cellSize * scale);
    const visibleTop =
        (-position.y - viewportRect.height * buffer) / (cellSize * scale);
    const visibleBottom =
        (-position.y + viewportRect.height * (1 + buffer)) / (cellSize * scale);

    // Calculate chunk coordinates
    const startChunkX = Math.floor(visibleLeft / chunkSize);
    const endChunkX = Math.ceil(visibleRight / chunkSize);
    const startChunkY = Math.floor(visibleTop / chunkSize);
    const endChunkY = Math.ceil(visibleBottom / chunkSize);

    // Generate chunk coordinates
    for (let x = startChunkX; x < endChunkX; x++) {
        for (let y = startChunkY; y < endChunkY; y++) {
            visibleChunkCoords.push({ x, y });
        }
    }

    return visibleChunkCoords;
};

/**
 * Generates a single cell's data using Perlin noise
 *
 * @param globalX - Global X coordinate of the cell
 * @param globalY - Global Y coordinate of the cell
 * @param saturationGenerator - Perlin noise generator for saturation
 * @param lightnessGenerator - Perlin noise generator for lightness
 * @returns Cell data with color and photo URL
 */
export const generateGridCell = (
    globalX: number,
    globalY: number,
    saturationGenerator: INoiseGenerator,
    lightnessGenerator: INoiseGenerator
): GridCellDatum => {
    // Calculate hue based on position
    const hue = (globalX * (95 / 360) + globalY * (95 / 360)) % 1;

    // Calculate saturation using Perlin noise
    const saturationNoiseValue = saturationGenerator.noise(
        globalX * 0.1,
        globalY * 0.1
    );
    const saturation = (saturationNoiseValue + 1) / 2; // Normalize to 0-1

    // Calculate lightness using Perlin noise
    const lightnessNoiseValue = lightnessGenerator.noise(
        globalX * 0.1,
        globalY * 0.1
    );
    const lightness = (lightnessNoiseValue + 1) / 2; // Normalize to 0-1

    // Convert HSL to hex color
    const color = chroma
        .hsl(hue * 360, saturation, lightness)
        .hex()
        .substring(1);

    return {
        color,
        photoUrl: null,
    };
};

/**
 * Generates initial chunks around the center point
 *
 * @param radius - Radius of chunks to generate (1 = 3x3 grid)
 * @param createChunkFn - Function to create a chunk
 * @returns Array of initial chunks
 */
export const generateInitialChunks = (
    radius: number,
    createChunkFn: (x: number, y: number) => Chunk
): Chunk[] => {
    const initialChunks: Chunk[] = [];

    for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
            initialChunks.push(createChunkFn(x, y));
        }
    }

    return initialChunks;
};
