import { useCallback, useEffect, useState } from 'react';

import type { GridPosition } from '@/types/grid';

interface UseGridInteractionsProps {
    gridRef: React.RefObject<HTMLDivElement>;
    isPhotoSelected: boolean;
    position: GridPosition;
    updatePosition: (position: GridPosition) => void;
}

interface UseGridInteractionsReturn {
    isDragging: boolean;
}

/**
 * Hook to handle grid interactions like dragging with mouse and touch
 */
export const useGridInteractions = ({
    gridRef,
    isPhotoSelected,
    position,
    updatePosition,
}: UseGridInteractionsProps): UseGridInteractionsReturn => {
    // Track if user is currently dragging
    const [isDragging, setIsDragging] = useState(false);

    // Track last pointer position for calculating movement delta
    const [lastPointerPosition, setLastPointerPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // Handle start of dragging (mouse down or touch start)
    const handleDragStart = useCallback(
        (event: MouseEvent | TouchEvent) => {
            // Only start dragging if the target is inside the grid element
            const gridElement = gridRef.current;
            if (!gridElement) return;

            const target = event.target as Node;
            if (!gridElement.contains(target)) return;

            setIsDragging(true);

            // Get initial position from event
            const clientX =
                'touches' in event
                    ? event.touches[0].clientX
                    : (event as MouseEvent).clientX;

            const clientY =
                'touches' in event
                    ? event.touches[0].clientY
                    : (event as MouseEvent).clientY;

            setLastPointerPosition({ x: clientX, y: clientY });
        },
        [gridRef]
    );

    // Handle dragging (mouse move or touch move)
    const handleDrag = useCallback(
        (event: MouseEvent | TouchEvent) => {
            if (!isDragging || !lastPointerPosition) return;

            // Get current position from event
            const clientX =
                'touches' in event
                    ? event.touches[0].clientX
                    : (event as MouseEvent).clientX;

            const clientY =
                'touches' in event
                    ? event.touches[0].clientY
                    : (event as MouseEvent).clientY;

            // Calculate movement delta
            const deltaX = clientX - lastPointerPosition.x;
            const deltaY = clientY - lastPointerPosition.y;

            // Update position
            updatePosition({
                x: position.x + deltaX,
                y: position.y + deltaY,
            });

            // Update last pointer position
            setLastPointerPosition({ x: clientX, y: clientY });
        },
        [isDragging, lastPointerPosition, position, updatePosition]
    );

    // Handle end of dragging (mouse up, mouse leave, or touch end)
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        setLastPointerPosition(null);
    }, []);

    // Add and remove event listeners
    useEffect(() => {
        if (!isPhotoSelected) {
            // All event listeners attached to document for consistency
            document.addEventListener('mousedown', handleDragStart);
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('mouseleave', handleDragEnd);

            // Touch events
            document.addEventListener('touchstart', handleDragStart);
            document.addEventListener('touchmove', handleDrag, {
                passive: false,
            });
            document.addEventListener('touchend', handleDragEnd);
            document.addEventListener('touchcancel', handleDragEnd);
        }

        // Prevent default touch behavior to avoid scrolling while dragging
        const preventDefaultTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', preventDefaultTouchMove, {
            passive: false,
        });

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleDragStart);
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('mouseleave', handleDragEnd);

            document.removeEventListener('touchstart', handleDragStart);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleDragEnd);
            document.removeEventListener('touchcancel', handleDragEnd);

            document.removeEventListener('touchmove', preventDefaultTouchMove);
        };
    }, [
        handleDragStart,
        handleDrag,
        handleDragEnd,
        isPhotoSelected,
        isDragging,
    ]);

    // Update cursor style based on dragging state
    useEffect(() => {
        if (!gridRef.current) return;

        if (isDragging) {
            gridRef.current.classList.add('cursor-grabbing');
            gridRef.current.classList.remove('cursor-grab');
        } else {
            gridRef.current.classList.add('cursor-grab');
            gridRef.current.classList.remove('cursor-grabbing');
        }
    }, [isDragging, gridRef]);

    return {
        isDragging,
    };
};
