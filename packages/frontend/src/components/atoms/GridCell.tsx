import React, { useState } from 'react';

import {
    useIntersectionObserver,
    usePreventDefaultAndStopPropagation,
} from '@/hooks';
import type { GridCellDatum } from '@/types/grid';

interface GridCellProps {
    cell: GridCellDatum;
}

export const GridCell: React.FC<GridCellProps> = ({ cell }) => {
    const [ref, isVisible] = useIntersectionObserver();

    const [imageLoaded, setImageLoaded] = useState(false);
    const preventDragDefault = usePreventDefaultAndStopPropagation();

    return (
        <div
            ref={ref}
            className="relative grid-cell w-[calc(var(--cell-size)_*_1px)] h-[calc(var(--cell-size)_*_1px)] bg-[var(--cell-color)]"
            style={{
                '--cell-color': `#${cell.color}`,
            }}
            draggable="false"
            onDragStart={preventDragDefault}
        >
            {isVisible && (
                <img
                    src={`/api/photo/${cell.color}`}
                    className={`w-full h-full object-cover [&[data-broken=true]]:hidden transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    draggable="false"
                    onDragStart={preventDragDefault}
                    onLoad={() => setImageLoaded(true)}
                    onError={(event) => {
                        event.currentTarget.setAttribute('data-broken', 'true');
                    }}
                />
            )}
        </div>
    );
};
