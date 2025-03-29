import React from 'react';

import { GridCell } from '@/components';
import { usePreventDefaultAndStopPropagation } from '@/hooks';
import type { Chunk } from '@/types/grid';

interface GridChunkProps {
    chunk: Chunk;
    cellSize: number;
    chunkSize: number;
}

export const GridChunk: React.FC<GridChunkProps> = ({
    chunk,
    cellSize,
    chunkSize,
}) => {
    const preventDragDefault = usePreventDefaultAndStopPropagation();

    return (
        <div
            className="absolute"
            style={{
                left: chunk.x * chunkSize * cellSize,
                top: chunk.y * chunkSize * cellSize,
                width: chunkSize * cellSize,
                height: chunkSize * cellSize,
            }}
            draggable="false"
            onDragStart={preventDragDefault}
        >
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${chunkSize}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${chunkSize}, ${cellSize}px)`,
                    width: '100%',
                    height: '100%',
                }}
                draggable="false"
                onDragStart={preventDragDefault}
            >
                {chunk.cells.map((row, y) =>
                    row.map((cell, x) => (
                        <GridCell
                            key={`${x}-${y}`}
                            cell={cell}
                            size={cellSize}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
