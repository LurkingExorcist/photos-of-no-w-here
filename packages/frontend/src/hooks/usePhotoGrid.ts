import { useEffect, useRef, useState } from 'react';

import type { Chunk, GridPosition } from '@/types/grid';

import { useVisibleChunks } from './chunks/useVisibleChunks';
import { useIsMobile } from './useIsMobile';
// Constants for grid configuration
const CHUNK_SIZE = 8;
const CHUNK_SIZE_MOBILE = 4;
const CELL_SIZE = 256;
const CELL_SIZE_MOBILE = 128;

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
    chunkSize: number;
    /** Size of each cell in pixels */
    cellSize: number;
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
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(true);
    const gridRef = useRef<HTMLDivElement>(null);

    const chunkSize = isMobile ? CHUNK_SIZE_MOBILE : CHUNK_SIZE;
    const cellSize = isMobile ? CELL_SIZE_MOBILE : CELL_SIZE;

    // Get visible chunks based on current position and scale
    const { chunks } = useVisibleChunks({
        position,
        scale,
        gridRef,
        chunkSize,
        cellSize,
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
        chunkSize,
        cellSize,
    };
};
