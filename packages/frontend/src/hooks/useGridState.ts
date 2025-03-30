import { useState } from 'react';

import type { GridPosition } from '@/types/grid';

/**
 * Simple hook for basic grid state without interaction
 * Maintains position and scale values as state
 */
export const useGridState = () => {
    // State for position and scale
    const [position, updatePosition] = useState<GridPosition>({ x: 0, y: 0 });
    const [scale, updateScale] = useState(1);

    // State for photo selection
    const [isPhotoSelected, updateIsPhotoSelected] = useState(false);

    /**
     * Reset the view to default position and scale
     */
    const resetView = () => {
        updatePosition({ x: 0, y: 0 });
        updateScale(1);
    };

    return {
        isPhotoSelected,
        position,
        scale,
        updateIsPhotoSelected,
        updatePosition,
        updateScale,
        resetView,
    };
};
