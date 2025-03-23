import React, { useEffect, useState } from 'react';

import { useGridInteractions } from '../hooks/useGridInteractions';
import { usePhotoGrid } from '../hooks/usePhotoGrid';

import { GridChunk } from './GridChunk';

interface PhotoGridProps {}

const PhotoGrid: React.FC<PhotoGridProps> = () => {
    const [showHelp, setShowHelp] = useState(true);

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
        CHUNK_SIZE,
        CELL_SIZE,
        MAX_ZOOM,
        MIN_ZOOM,
    } = usePhotoGrid();

    const {
        x,
        y,
        scale: currentScale,
        bindDrag,
        bindWheel,
        resetView,
    } = useGridInteractions({
        position,
        setPosition,
        scale,
        setScale,
        isDragging,
        setIsDragging,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
    });

    // Hide help after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHelp(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // This effect adds GPU acceleration hints for smoother animations
    useEffect(() => {
        if (gridRef.current) {
            const nodes = gridRef.current.querySelectorAll('.gpu-accelerated');
            nodes.forEach((node) => {
                // Force GPU acceleration
                (node as HTMLElement).style.transform = 'translateZ(0)';
                (node as HTMLElement).style.backfaceVisibility = 'hidden';
            });
        }
    }, [gridRef]);

    // Effect to log state changes for debugging
    useEffect(() => {
        console.log('Drag state:', { isDragging, x, y });
    }, [isDragging, x, y]);

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
            {...bindWheel()}
        >
            {/* Help overlay */}
            {showHelp && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 pointer-events-none">
                    <div className="text-white text-center p-6 max-w-md">
                        <h2 className="text-2xl mb-4">Photo Grid Controls</h2>
                        <ul className="text-left space-y-2">
                            <li>
                                • <b>Drag</b> to pan around the grid
                            </li>
                            <li>
                                • Use <b>mouse wheel</b> to zoom in/out
                            </li>
                            <li>
                                • On mobile, use <b>pinch gestures</b> to zoom
                            </li>
                            <li>
                                • Click <b>Reset View</b> to return to center
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                    onClick={resetView}
                    className="px-3 py-1.5 bg-white bg-opacity-80 text-gray-800 rounded-md hover:bg-opacity-100 transition-colors shadow-md"
                >
                    Reset View
                </button>
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="px-3 py-1.5 bg-white bg-opacity-80 text-gray-800 rounded-md hover:bg-opacity-100 transition-colors shadow-md"
                >
                    {showHelp ? 'Hide Help' : 'Show Help'}
                </button>
                <div className="px-3 py-1.5 bg-white bg-opacity-80 text-gray-800 rounded-md shadow-md text-xs">
                    <div>Zoom: {currentScale.toFixed(2)}</div>
                    <div>
                        Pan: [{x.toFixed(0)}, {y.toFixed(0)}]
                    </div>
                    <div className="text-xs mt-1">
                        {isDragging ? '✓ Dragging' : '✗ Not Dragging'}
                    </div>
                </div>
            </div>

            <div
                ref={gridRef}
                className={`absolute top-0 left-0 w-full h-full touch-none select-none ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                {...bindDrag()}
                style={{
                    touchAction: 'none',
                    userSelect: 'none',
                }}
            >
                <div
                    className="absolute top-1/2 left-1/2 origin-center will-change-transform gpu-accelerated"
                    style={{
                        transform: `translate3d(${x}px, ${y}px, 0) scale(${currentScale})`,
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
