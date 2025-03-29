import React from 'react';

import { GridChunk } from '@/components';
import {
    useGridIntegrations,
    useGridState,
    usePhotoGrid,
    usePreventDefaultAndStopPropagation,
} from '@/hooks';

// const MAX_ZOOM = 5;
// const MIN_ZOOM = 0.5;

interface PhotoGridProps {}

export const PhotoGrid: React.FC<PhotoGridProps> = () => {
    const preventDefault = usePreventDefaultAndStopPropagation();

    // Get grid state (position and scale)
    const { position, scale, updatePosition } = useGridState();

    // Get grid state and methods
    const { chunks, gridRef, CHUNK_SIZE, CELL_SIZE } = usePhotoGrid({
        position,
        scale,
    });

    useGridIntegrations({
        gridRef,
        position,
        updatePosition,
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
                        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
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
