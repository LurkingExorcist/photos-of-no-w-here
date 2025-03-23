import React, { useEffect, useRef, useState } from 'react';

import type { GridCell as GridCellType } from '../hooks/usePhotoGrid';

interface GridCellProps {
    cell: GridCellType;
    size: number;
}

export const GridCell: React.FC<GridCellProps> = ({ cell, size }) => {
    const [isVisible, setIsVisible] = useState(false);
    const cellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '50px', // Start loading slightly before the cell becomes visible
                threshold: 0.1, // Trigger when at least 10% of the cell is visible
            }
        );

        const currentCell = cellRef.current;
        if (currentCell) {
            observer.observe(currentCell);
        }

        return () => {
            if (currentCell) {
                observer.unobserve(currentCell);
            }
        };
    }, []);

    // Prevent default behavior for drag events
    const preventDragDefault = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    return (
        <div
            ref={cellRef}
            className="relative grid-cell"
            style={{
                width: size,
                height: size,
                backgroundColor: `#${cell.color}`, // Show color as background while loading
                pointerEvents: 'none', // Pass through all pointer events
            }}
            draggable="false"
            onDragStart={preventDragDefault}
        >
            {isVisible && (
                <img
                    src={`http://localhost:3333/photo/${cell.color}`}
                    className="w-full h-full object-cover"
                    alt={`Color #${cell.color}`}
                    draggable="false"
                    onDragStart={preventDragDefault}
                    style={{ pointerEvents: 'none' }}
                    onError={() => {
                        console.error(
                            `Failed to load image for color ${cell.color}`
                        );
                    }}
                />
            )}
        </div>
    );
};
