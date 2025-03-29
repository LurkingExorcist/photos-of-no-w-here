import React from 'react';

import {
    useIntersectionObserver,
    usePreventDefaultAndStopPropagation,
} from '../../hooks';

import type { GridCellDatum } from '../../types/grid';

interface GridCellProps {
    cell: GridCellDatum;
    size: number;
}

export const GridCell: React.FC<GridCellProps> = ({ cell, size }) => {
    const [ref, isVisible] = useIntersectionObserver({
        rootMargin: '50px',
        threshold: 0.1,
    });

    const preventDragDefault = usePreventDefaultAndStopPropagation();

    return (
        <div
            ref={ref}
            className="relative grid-cell"
            style={{
                width: size,
                height: size,
                backgroundColor: `#${cell.color}`, // Show color as background while loading
            }}
            draggable="false"
            onDragStart={preventDragDefault}
        >
            {isVisible && (
                <img
                    src={`/api/photo/${cell.color}`}
                    className="w-full h-full object-cover [&[data-broken=true]]:hidden"
                    draggable="false"
                    onDragStart={preventDragDefault}
                    onError={(event) => {
                        event.currentTarget.setAttribute('data-broken', 'true');
                    }}
                />
            )}
        </div>
    );
};
