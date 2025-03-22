import { useCallback, useEffect } from 'react';

import type { DragStart, GridPosition } from './usePhotoGrid';

interface UseGridInteractionsProps {
    position: GridPosition;
    setPosition: (position: GridPosition) => void;
    scale: number;
    setScale: (scale: number) => void;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    dragStartRef: React.MutableRefObject<DragStart>;
    minZoom: number;
    maxZoom: number;
}

export const useGridInteractions = ({
    position,
    setPosition,
    scale,
    setScale,
    isDragging,
    setIsDragging,
    dragStartRef,
    minZoom,
    maxZoom,
}: UseGridInteractionsProps) => {
    // Mouse down handler for dragging
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                posX: position.x,
                posY: position.y,
            };
        },
        [setIsDragging, position, dragStartRef]
    );

    // Mouse move handler for dragging
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setPosition({
                x: dragStartRef.current.posX + dx,
                y: dragStartRef.current.posY + dy,
            });
        },
        [isDragging, setPosition, dragStartRef]
    );

    // Mouse up handler for ending drag
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, [setIsDragging]);

    // Wheel handler for zooming
    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY * -0.0001;
            const newScale = Math.max(
                minZoom,
                Math.min(maxZoom, scale + delta)
            );
            setScale(newScale);
        },
        [scale, setScale, minZoom, maxZoom]
    );

    // Add and remove event listeners for drag
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        handleMouseDown,
        handleWheel,
    };
};
