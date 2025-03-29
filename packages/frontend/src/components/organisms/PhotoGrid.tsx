import React from 'react';

import { GridChunk } from '@/components';
import {
    useGridInteractions,
    useGridState,
    usePhotoGrid,
    usePreventDefaultAndStopPropagation,
} from '@/hooks';

interface PhotoGridProps {}

export const PhotoGrid: React.FC<PhotoGridProps> = () => {
    const preventDefault = usePreventDefaultAndStopPropagation();

    // Get grid state (position and scale)
    const { position, scale, updatePosition } = useGridState();

    // Get grid state and methods
    const { chunks, gridRef, chunkSize, cellSize } = usePhotoGrid({
        position,
        scale,
    });

    useGridInteractions({
        gridRef,
        position,
        updatePosition,
    });

    return (
        <div
            className="relative w-full h-screen overflow-hidden"
            onDragStart={preventDefault}
        >
            <div
                ref={gridRef}
                className="absolute top-0 left-0 w-full h-full"
                onDragStart={preventDefault}
                draggable="false"
            >
                <div
                    className={`absolute
                    top-1/2 left-1/2
                    origin-center will-change-transform
                    translate-x-[calc(var(--position-x))] translate-y-[calc(var(--position-y))]
                    scale-[var(--scale)]
                    pointer-events-none`}
                    style={{
                        '--chunk-size': chunkSize.toString(),
                        '--cell-size': `${cellSize}px`,
                        '--position-x': `${position.x}px`,
                        '--position-y': `${position.y}px`,
                        '--scale': `${scale}`,
                    }}
                    onDragStart={preventDefault}
                    draggable="false"
                >
                    {chunks.map((chunk) => (
                        <GridChunk
                            key={`${chunk.x}-${chunk.y}`}
                            chunk={chunk}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
