import React from 'react';

import {
    useGridState,
    usePhotoGrid,
    usePreventDefaultAndStopPropagation,
} from '../../hooks';
import { GridChunk } from '../molecules';

// const MAX_ZOOM = 5;
// const MIN_ZOOM = 0.5;

interface PhotoGridProps {}

export const PhotoGrid: React.FC<PhotoGridProps> = () => {
    const preventDefault = usePreventDefaultAndStopPropagation();

    // Get grid state (position and scale)
    const { x, y, scale: currentScale } = useGridState();

    // Get grid state and methods
    const { chunks, gridRef, CHUNK_SIZE, CELL_SIZE } = usePhotoGrid({
        position: { x, y },
        scale: currentScale,
    });

    return (
        <div
            className="relative w-full h-screen overflow-hidden bg-gray-900"
            onDragStart={preventDefault}
        >
            <div
                ref={gridRef}
                className="absolute top-0 left-0 w-full h-full"
                onDragStart={preventDefault}
                draggable="false"
            >
                <div
                    className="absolute top-1/2 left-1/2 origin-center will-change-transform"
                    style={{
                        transform: `translate3d(${x}px, ${y}px, 0) scale(${currentScale})`,
                        pointerEvents: 'none',
                    }}
                    onDragStart={preventDefault}
                    draggable="false"
                >
                    {chunks.map((chunk) => (
                        <GridChunk
                            key={`${chunk.x}-${chunk.y}`}
                            chunk={chunk}
                            cellSize={CELL_SIZE}
                            chunkSize={CHUNK_SIZE}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
