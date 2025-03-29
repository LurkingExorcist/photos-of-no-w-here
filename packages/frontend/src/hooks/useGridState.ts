import { useState } from 'react';

import type { GridPosition } from '../types/grid';

/**
 * Simple hook for basic grid state without interaction
 * Maintains position and scale values as state
 */
export const useGridState = () => {
    // State for position and scale
    const [position, setPosition] = useState<GridPosition>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    /**
     * Reset the view to default position and scale
     */
    const resetView = () => {
        setPosition({ x: 0, y: 0 });
        setScale(1);
    };

    return {
        position,
        setPosition,
        scale,
        setScale,
        x: position.x,
        y: position.y,
        resetView,
    };
};
