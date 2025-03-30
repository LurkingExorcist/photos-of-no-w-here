import { useCallback, useRef } from 'react';

import type { GridPosition } from '@/types/grid';

import { useIsMobile } from './useIsMobile';

interface UseSelectPhotoProps {
    gridRef: React.RefObject<HTMLDivElement>;
    position: GridPosition;
    scale: number;
    isDragging: boolean;
    isPhotoSelected: boolean;
    updatePosition: (position: GridPosition) => void;
    updateScale: (scale: number) => void;
    updateIsPhotoSelected: (isPhotoSelected: boolean) => void;
}

/**
 * Hook to handle photo selection and centering/zooming behavior
 */
export const useSelectPhoto = ({
    gridRef,
    position,
    isDragging,
    isPhotoSelected,
    updatePosition,
    updateScale,
    updateIsPhotoSelected,
}: UseSelectPhotoProps) => {
    const isMobile = useIsMobile();
    const clickStartTimeRef = useRef<number | null>(null);

    const updateScaleAndPosition = useCallback(
        (newScale: number, newPosition: GridPosition) => {
            updateScale(newScale);
            updatePosition(newPosition);
        },
        [updateScale, updatePosition]
    );

    const smoothScaleIntoPhoto = useCallback(
        (gridCell: DOMRect) => {
            if (!gridRef.current) return;
            const viewRect = gridRef.current?.getBoundingClientRect();

            const gridCellCenterX = gridCell.left + gridCell.width / 2;
            const gridCellCenterY = gridCell.top + gridCell.height / 2;

            // Calculate grid center
            const gridCenterX = viewRect.left + viewRect.width / 2;
            const gridCenterY = viewRect.top + viewRect.height / 2;

            // Calculate offset needed to center the photo
            const offsetX = gridCenterX - gridCellCenterX;
            const offsetY = gridCenterY - gridCellCenterY;

            const targetScale = isMobile
                ? viewRect.width / gridCell.width
                : viewRect.height / gridCell.height;

            updateScaleAndPosition(targetScale, {
                x: (position.x + offsetX) * targetScale,
                y: (position.y + offsetY) * targetScale,
            });
        },
        [gridRef, isMobile, position, updateScaleAndPosition]
    );

    /**
     * Handles click on a photo in the grid
     * Centers the view on the clicked photo and optionally zooms in
     */
    const onPhotoClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            // Prevent event bubbling
            event.stopPropagation();
            event.preventDefault();

            // If grid reference isn't available, do nothing
            if (!gridRef.current || isDragging || isPhotoSelected) return;

            // Calculate time since mousedown (if available)
            const now = Date.now();
            const clickStartTime = clickStartTimeRef.current;
            const isQuickClick = clickStartTime && now - clickStartTime < 300;

            // Reset the click start time
            clickStartTimeRef.current = null;

            // Only proceed if this was a quick click or no mousedown was recorded
            if (!isQuickClick && clickStartTime !== null) return;

            const gridCell = event.currentTarget.getBoundingClientRect();

            smoothScaleIntoPhoto(gridCell);
            updateIsPhotoSelected(true);
        },
        [
            gridRef,
            isDragging,
            isPhotoSelected,
            smoothScaleIntoPhoto,
            updateIsPhotoSelected,
        ]
    );

    // Track when the mouse is pressed down
    const onPhotoMouseDown = useCallback(() => {
        clickStartTimeRef.current = Date.now();
    }, []);

    return {
        bindCellElement: (): React.HTMLAttributes<HTMLButtonElement> => ({
            onClick: onPhotoClick,
            onMouseDown: onPhotoMouseDown,
        }),
    };
};
