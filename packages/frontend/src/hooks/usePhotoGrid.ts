import { useEffect, useRef, useState } from 'react';

import { useVisibleChunks } from './grid/useVisibleChunks';

import type { Chunk, GridPosition } from '../types/grid';

// Constants for grid configuration
const CHUNK_SIZE = 10;
const CELL_SIZE = 100;

/**
 * Props for the usePhotoGrid hook
 */
interface UsePhotoGridProps {
    /** Current grid position */
    position: GridPosition;
    /** Current scale value */
    scale: number;
}

/**
 * Return type for the usePhotoGrid hook
 */
interface PhotoGridResult {
    /** Array of chunk data currently visible in the viewport */
    chunks: Chunk[];
    /** Whether the grid is still loading */
    loading: boolean;
    /** Reference to the grid container element */
    gridRef: React.RefObject<HTMLDivElement>;
    /** Size of each chunk in cells */
    CHUNK_SIZE: number;
    /** Size of each cell in pixels */
    CELL_SIZE: number;
}

/**
 * Hook that manages the photo grid system
 *
 * Combines multiple grid-related hooks for a complete grid experience:
 * - Tracks visible chunks
 * - Manages loading states
 * - Maintains grid reference
 *
 * @param props - Grid position and scale
 * @returns Grid state and configuration
 */
export const usePhotoGrid = ({
    position,
    scale,
}: UsePhotoGridProps): PhotoGridResult => {
    const [loading, setLoading] = useState(true);
    const gridRef = useRef<HTMLDivElement>(null);

    // Get visible chunks based on current position and scale
    const { chunks } = useVisibleChunks({
        position,
        scale,
        gridRef,
        chunkSize: CHUNK_SIZE,
        cellSize: CELL_SIZE,
    });

    const isChunksFilled = chunks.length > 0;

    // Update loading state when chunks are available
    useEffect(() => {
        if (loading && isChunksFilled) {
            setLoading(false);
        }
    }, [isChunksFilled, loading]);

    return {
        chunks,
        loading,
        gridRef,
        CHUNK_SIZE,
        CELL_SIZE,
    };
};
