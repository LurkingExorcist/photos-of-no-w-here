import React from 'react';

import { GridCell } from './GridCell';

import type { Chunk } from '../hooks/usePhotoGrid';

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
    // Prevent default behavior for drag events
    const preventDragDefault = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    return (
        <div
            className="absolute"
            style={{
                left: chunk.x * chunkSize * cellSize,
                top: chunk.y * chunkSize * cellSize,
                width: chunkSize * cellSize,
                height: chunkSize * cellSize,
                pointerEvents: 'none', // Pass through all pointer events
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
                    pointerEvents: 'none', // Pass through all pointer events
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
