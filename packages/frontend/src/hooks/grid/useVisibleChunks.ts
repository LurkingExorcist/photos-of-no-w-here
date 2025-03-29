import { useCallback, useEffect, useRef, useState } from 'react';

import {
    generateInitialChunks,
    getVisibleChunkCoordinates,
} from '../../utils/chunk';

import { useChunkGeneration } from './useChunkGeneration';

import type { Chunk, GridPosition } from '../../types/grid';

/**
 * Props for the useVisibleChunks hook
 */
interface UseVisibleChunksProps {
    /** Reference to the grid container element */
    gridRef: React.RefObject<HTMLDivElement>;
    /** Current grid position */
    position: GridPosition;
    /** Current scale value */
    scale: number;
    /** Size of each chunk in grid cells */
    chunkSize: number;
    /** Size of each cell in pixels */
    cellSize: number;
}

/**
 * Return type for the useVisibleChunks hook
 */
interface VisibleChunksResult {
    /** Array of chunk data currently visible in the viewport */
    chunks: Chunk[];
}

/**
 * Hook for managing visible chunks in the grid viewport
 *
 * Dynamically loads chunks as they become visible in the viewport
 * and keeps track of all loaded chunks
 *
 * @param props - Configuration and state for chunk visibility
 * @returns Object containing visible chunks
 */
export const useVisibleChunks = ({
    gridRef,
    position,
    scale,
    chunkSize,
    cellSize,
}: UseVisibleChunksProps): VisibleChunksResult => {
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const { createChunk } = useChunkGeneration({ chunkSize });

    // Track current position and scale in refs
    const positionRef = useRef(position);
    const scaleRef = useRef(scale);
    positionRef.current = position;
    scaleRef.current = scale;

    // Track if we're currently loading chunks
    const isLoadingRef = useRef(false);

    /**
     * Calculates which chunks are currently visible in the viewport
     */
    const getVisibleChunks = useCallback(() => {
        const gridElement = gridRef.current;
        if (!gridElement) return [];

        const rect = gridElement.getBoundingClientRect();
        return getVisibleChunkCoordinates(
            positionRef.current,
            scaleRef.current,
            rect,
            chunkSize,
            cellSize
        );
    }, [gridRef, chunkSize, cellSize]);

    /**
     * Loads new chunks when they become visible and removes chunks that are far from viewport
     */
    const loadVisibleChunks = useCallback(() => {
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        const visibleChunkCoords = getVisibleChunks();

        setChunks((prevChunks) => {
            const newChunks: Chunk[] = [];

            // Keep only chunks that are visible or within a small buffer
            visibleChunkCoords.forEach(({ x, y }) => {
                const existingChunk = prevChunks.find(
                    (chunk) => chunk.x === x && chunk.y === y
                );
                if (existingChunk) {
                    newChunks.push(existingChunk);
                } else {
                    newChunks.push(createChunk(x, y));
                }
            });

            return newChunks;
        });

        // Reset loading flag after a short delay
        setTimeout(() => {
            isLoadingRef.current = false;
        }, 100);
    }, [getVisibleChunks, createChunk]);

    // Load chunks that become visible due to position/scale changes
    useEffect(() => {
        const timeoutId = setTimeout(loadVisibleChunks, 50);
        return () => clearTimeout(timeoutId);
    }, [position, scale, loadVisibleChunks]);

    // Initialize the grid with initial chunks
    useEffect(() => {
        // Generate 2x2 grid of chunks around center
        const initialChunks = generateInitialChunks(0.5, createChunk);
        setChunks(initialChunks);
    }, [createChunk]);

    return { chunks };
};
