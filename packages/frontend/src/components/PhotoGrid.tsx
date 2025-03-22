import React from 'react';

import { useGridInteractions } from '../hooks/useGridInteractions';
import { usePhotoGrid } from '../hooks/usePhotoGrid';

import { GridChunk } from './GridChunk';

interface PhotoGridProps {}

const PhotoGrid: React.FC<PhotoGridProps> = () => {
    const {
        chunks,
        loading,
        position,
        setPosition,
        scale,
        setScale,
        isDragging,
        setIsDragging,
        gridRef,
        dragStartRef,
        CHUNK_SIZE,
        CELL_SIZE,
        MAX_ZOOM,
        MIN_ZOOM,
    } = usePhotoGrid();

    const { handleMouseDown, handleWheel } = useGridInteractions({
        position,
        setPosition,
        scale,
        setScale,
        isDragging,
        setIsDragging,
        dragStartRef,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
    });

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                    <p className="text-gray-800">Loading grid...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-screen overflow-hidden bg-gray-900"
            onWheel={handleWheel}
        >
            <div
                ref={gridRef}
                className={`absolute top-0 left-0 w-full h-full touch-none ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onMouseDown={handleMouseDown}
                style={{
                    touchAction: 'none',
                    userSelect: 'none',
                }}
            >
                <div
                    className="absolute top-1/2 left-1/2 origin-center"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging
                            ? 'none'
                            : 'transform 0.05s ease',
                    }}
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

export default PhotoGrid;
