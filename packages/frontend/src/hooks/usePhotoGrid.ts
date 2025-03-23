import chroma from 'chroma-js';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PerlinNoise } from '../utils/perlinNoise';

export interface GridCell {
    color: string;
    photoUrl: string | null;
}

export interface Chunk {
    x: number;
    y: number;
    cells: GridCell[][];
}

export interface GridPosition {
    x: number;
    y: number;
}

export interface DragStart {
    x: number;
    y: number;
    posX: number;
    posY: number;
}

const CHUNK_SIZE = 10;
const CELL_SIZE = 100;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.5;

export const usePhotoGrid = () => {
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [loading, setLoading] = useState(true);
    const [position, setPosition] = useState<GridPosition>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<DragStart>({ x: 0, y: 0, posX: 0, posY: 0 });

    // Initialize Perlin noise generators with random seeds
    const saturationNoise = useRef(new PerlinNoise(Math.random() * 1000));
    const lightnessNoise = useRef(new PerlinNoise(Math.random() * 1000));

    // Generate a chunk of colors with HSL-based transitions
    const generateChunk = useCallback(
        (chunkX: number, chunkY: number): GridCell[][] => {
            const newChunk: GridCell[][] = [];

            for (let y = 0; y < CHUNK_SIZE; y++) {
                newChunk[y] = [];
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    // Calculate global position
                    const globalX = chunkX * CHUNK_SIZE + x;
                    const globalY = chunkY * CHUNK_SIZE + y;

                    // Calculate hue based on position
                    const hue =
                        (globalX * (48 / 360) + globalY * (95 / 360)) % 1;

                    // Calculate saturation using Perlin noise
                    const saturationNoiseValue = saturationNoise.current.noise(
                        globalX * 0.1,
                        globalY * 0.1
                    );
                    const saturation = (saturationNoiseValue + 1) / 2; // Normalize to 0-1

                    // Calculate lightness using Perlin noise
                    const lightnessNoiseValue = lightnessNoise.current.noise(
                        globalX * 0.1,
                        globalY * 0.1
                    );
                    const lightness = (lightnessNoiseValue + 1) / 2; // Normalize to 0-1

                    // Convert HSL to hex color
                    const color = chroma
                        .hsl(hue * 360, saturation, lightness)
                        .hex()
                        .substring(1);

                    newChunk[y][x] = {
                        color,
                        photoUrl: null,
                    };
                }
            }

            return newChunk;
        },
        []
    );

    // Function to get visible chunks based on viewport
    const getVisibleChunks = useCallback(() => {
        if (!gridRef.current) return [];

        const rect = gridRef.current.getBoundingClientRect();
        const visibleChunks: { x: number; y: number }[] = [];

        // Calculate visible area in grid coordinates
        const visibleLeft = (-position.x - rect.width) / (CELL_SIZE * scale);
        const visibleRight =
            (-position.x + rect.width * 2) / (CELL_SIZE * scale);
        const visibleTop = (-position.y - rect.height) / (CELL_SIZE * scale);
        const visibleBottom =
            (-position.y + rect.height * 2) / (CELL_SIZE * scale);

        // Calculate chunk coordinates
        const startChunkX = Math.floor(visibleLeft / CHUNK_SIZE);
        const endChunkX = Math.ceil(visibleRight / CHUNK_SIZE);
        const startChunkY = Math.floor(visibleTop / CHUNK_SIZE);
        const endChunkY = Math.ceil(visibleBottom / CHUNK_SIZE);

        // Generate chunk coordinates
        for (let x = startChunkX; x < endChunkX; x++) {
            for (let y = startChunkY; y < endChunkY; y++) {
                visibleChunks.push({ x, y });
            }
        }

        return visibleChunks;
    }, [position, scale]);

    // Load chunks when they become visible
    useEffect(() => {
        const visibleChunks = getVisibleChunks();
        const newChunks: Chunk[] = [...chunks];

        visibleChunks.forEach(({ x, y }) => {
            if (!chunks.some((chunk) => chunk.x === x && chunk.y === y)) {
                newChunks.push({
                    x,
                    y,
                    cells: generateChunk(x, y),
                });
            }
        });

        setChunks(newChunks);
    }, [position, scale, chunks, getVisibleChunks, generateChunk]);

    // Initialize the grid with initial chunks
    useEffect(() => {
        // Generate initial chunks around the center
        const initialChunks: Chunk[] = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                initialChunks.push({
                    x,
                    y,
                    cells: generateChunk(x, y),
                });
            }
        }
        setChunks(initialChunks);
        setLoading(false);
    }, [generateChunk]);

    return {
        chunks,
        loading,
        position,
        setPosition,
        scale,
        setScale,
        isDragging,
        setIsDragging,
        gridRef,
        dragStartRef,
        CHUNK_SIZE,
        CELL_SIZE,
        MAX_ZOOM,
        MIN_ZOOM,
    };
};
