import React, { useState } from 'react';

import {
    useIntersectionObserver,
    usePreventDefaultAndStopPropagation,
} from '@/hooks';
import type { GridCellDatum } from '@/types/grid';
import { useDebug } from '@/hooks/useDebug';

interface GridCellProps {
    cell: GridCellDatum;
    bindCellElement: () => React.HTMLAttributes<HTMLButtonElement>;
}

export const GridCell: React.FC<GridCellProps> = ({
    cell,
    bindCellElement,
}) => {
    const isDebug = useDebug();

    const [ref, isVisible] = useIntersectionObserver<HTMLButtonElement>({
        rootMargin: '256px',
    });

    const [imageLoaded, setImageLoaded] = useState(false);
    const preventDragDefault = usePreventDefaultAndStopPropagation();

    return (
        <button
            ref={ref}
            className="relative grid-cell w-[calc(var(--cell-size)_*_1px)] h-[calc(var(--cell-size)_*_1px)] bg-[var(--cell-color)]"
            style={{
                '--cell-color': `#${cell.color}`,
            }}
            draggable="false"
            onDragStart={preventDragDefault}
            type="button"
            aria-label={`Photo ${cell.color}`}
            {...bindCellElement()}
        >
            {isDebug && <div className="absolute top-0 left-0 w-full h-full text-left">
                <div className="text-xs text-white">
                    <b>saturationNoiseValue:</b> {cell.saturationNoiseValue}
                </div>
                <div className="text-xs text-white">
                    <b>saturation:</b> {cell.saturation}
                </div>
                <div className="text-xs text-white">
                    <b>lightnessNoiseValue:</b> {cell.lightnessNoiseValue}
                </div>
                <div className="text-xs text-white">
                    <b>lightness:</b> {cell.lightness}
                </div>
            </div>}
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
        </button>
    );
};
