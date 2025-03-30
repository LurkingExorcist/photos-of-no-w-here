import React, { useState } from 'react';

import { GridCell } from '@/components';
import {
    useIntersectionObserver,
    usePreventDefaultAndStopPropagation,
} from '@/hooks';
import type { Chunk } from '@/types/grid';

interface GridChunkProps {
    chunk: Chunk;
    bindCellElement: () => React.HTMLAttributes<HTMLButtonElement>;
}

export const GridChunk: React.FC<GridChunkProps> = ({
    chunk,
    bindCellElement,
}) => {
    const preventDragDefault = usePreventDefaultAndStopPropagation();
    const [ref, isVisible] = useIntersectionObserver({
        rootMargin: '256px',
    });
    const [hasAppeared, setHasAppeared] = useState(false);

    // Set hasAppeared to true once the chunk becomes visible
    React.useEffect(() => {
        if (isVisible && !hasAppeared) {
            setHasAppeared(true);
        }
    }, [isVisible, hasAppeared]);

    return (
        <div
            ref={ref}
            className={`absolute transition-opacity duration-500 ${
                hasAppeared ? 'opacity-100' : 'opacity-0'
            }
                left-[calc(var(--chunk-x)_*_var(--chunk-size)_*_var(--cell-size))]
                top-[calc(var(--chunk-y)_*_var(--chunk-size)_*_var(--cell-size))]
                width-[calc(var(--chunk-size)_*_var(--cell-size))]
                height-[calc(var(--chunk-size)_*_var(--cell-size))]
            `}
            style={{
                '--chunk-x': `${chunk.x}`,
                '--chunk-y': `${chunk.y}`,
            }}
            draggable="false"
            onDragStart={preventDragDefault}
        >
            <div
                className={`
                    grid
                    grid-cols-[repeat(var(--chunk-size),var(--cell-size))]
                    grid-rows-[repeat(var(--chunk-size),var(--cell-size))]
                    w-full h-full
                `}
                draggable="false"
                onDragStart={preventDragDefault}
            >
                {chunk.cells.map((row, y) =>
                    row.map((cell, x) => (
                        <GridCell
                            key={`${x}-${y}`}
                            cell={cell}
                            bindCellElement={bindCellElement}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
