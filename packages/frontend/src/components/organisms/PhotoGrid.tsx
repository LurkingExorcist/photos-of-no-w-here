import React from 'react';

import { CloseButton, GridChunk } from '@/components';
import {
    useGridInteractions,
    useGridState,
    usePhotoGrid,
    usePreventDefaultAndStopPropagation,
    useSelectPhoto,
} from '@/hooks';

const translateTransitionDuration = 500;

interface PhotoGridProps {}

export const PhotoGrid: React.FC<PhotoGridProps> = () => {
    const preventDefault = usePreventDefaultAndStopPropagation();

    // Get grid state (position and scale)
    const {
        isPhotoSelected,
        position,
        scale,
        updateIsPhotoSelected,
        updatePosition,
        updateScale,
    } = useGridState();

    // Get grid state and methods
    const { chunks, gridRef, chunkSize, cellSize } = usePhotoGrid({
        position,
        scale,
    });

    const { isDragging } = useGridInteractions({
        gridRef,
        position,
        isPhotoSelected,
        updatePosition,
    });

    const { bindCellElement } = useSelectPhoto({
        gridRef,
        scale,
        position,
        isDragging,
        isPhotoSelected,
        updatePosition,
        updateScale,
        updateIsPhotoSelected,
    });

    return (
        <div
            className="relative w-full h-screen overflow-hidden"
            onDragStart={preventDefault}
            style={{
                '--translate-transition-duration': `${translateTransitionDuration}ms`,
            }}
        >
            <CloseButton
                isPhotoSelected={isPhotoSelected}
                position={position}
                scale={scale}
                translateTransitionDuration={translateTransitionDuration}
                updateIsPhotoSelected={updateIsPhotoSelected}
                updatePosition={updatePosition}
                updateScale={updateScale}
            />
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
                        ${!isDragging ? 'transition-transform duration-[var(--translate-transition-duration)] ' : ''}
                    `}
                    style={{
                        '--chunk-size': `${chunkSize}`,
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
                            bindCellElement={bindCellElement}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
