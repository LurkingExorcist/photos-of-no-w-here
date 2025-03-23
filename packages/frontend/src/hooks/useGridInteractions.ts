import { useDrag, usePinch, useWheel } from '@use-gesture/react';
import { useCallback, useEffect, useRef } from 'react';

import type { GridPosition } from './usePhotoGrid';

interface UseGridInteractionsProps {
    position: GridPosition;
    setPosition: (position: GridPosition) => void;
    scale: number;
    setScale: (scale: number) => void;
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
    minZoom: number;
    maxZoom: number;
}

interface DragStartPosition {
    x: number;
    y: number;
    clientX: number;
    clientY: number;
}

export const useGridInteractions = ({
    position,
    setPosition,
    scale,
    setScale,
    isDragging,
    setIsDragging,
    minZoom,
    maxZoom,
}: UseGridInteractionsProps) => {
    // Track last animation request for smooth animations
    const animationRef = useRef<number | null>(null);

    // Track drag start position for more accurate calculations
    const dragStartRef = useRef<DragStartPosition>({
        x: 0,
        y: 0,
        clientX: 0,
        clientY: 0,
    });

    // Track pinch state
    const pinchRef = useRef({
        active: false,
        initialScale: 1,
    });

    // Target values for smooth animations
    const targetRef = useRef({
        x: position.x,
        y: position.y,
        scale: scale,
    });

    // Synchronize target with position when not dragging
    useEffect(() => {
        if (!isDragging && !pinchRef.current.active) {
            targetRef.current = {
                x: position.x,
                y: position.y,
                scale: scale,
            };
        }
    }, [position.x, position.y, scale, isDragging]);

    // Animate smoothly to target values
    const animate = useCallback(() => {
        if (isDragging || pinchRef.current.active) {
            // Don't animate while dragging or pinching for more responsive feel
            animationRef.current = null;
            return;
        }

        const target = targetRef.current;
        const dx = target.x - position.x;
        const dy = target.y - position.y;
        const dScale = target.scale - scale;

        // If we're close enough to the target, snap to it
        const isXDone = Math.abs(dx) < 0.5;
        const isYDone = Math.abs(dy) < 0.5;
        const isScaleDone = Math.abs(dScale) < 0.005;

        if (isXDone && isYDone && isScaleDone) {
            // Animation complete, set exact values
            if (position.x !== target.x || position.y !== target.y) {
                setPosition({ x: target.x, y: target.y });
            }
            if (scale !== target.scale) {
                setScale(target.scale);
            }
            animationRef.current = null;
            return;
        }

        // Animation still in progress, apply easing
        const ease = 0.15;
        setPosition({
            x: position.x + dx * ease,
            y: position.y + dy * ease,
        });
        setScale(scale + dScale * ease);

        // Continue animation
        animationRef.current = requestAnimationFrame(animate);
    }, [position, scale, setPosition, setScale, isDragging]);

    // Cancel animations on unmount
    const cancelAnimation = useCallback(() => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    // Set up drag gesture - enhanced implementation for reliability
    const bindDrag = useDrag(
        ({ active, first, last, xy: [clientX, clientY], event, memo = 0 }) => {
            // Skip if we're pinching
            if (pinchRef.current.active) return;

            // Ensure we're handling the event exclusively
            if (
                event &&
                'stopPropagation' in event &&
                typeof event.stopPropagation === 'function'
            ) {
                event.stopPropagation();
            }

            if (
                event &&
                'preventDefault' in event &&
                typeof event.preventDefault === 'function'
            ) {
                event.preventDefault();
            }

            // On first touch/click
            if (first) {
                setIsDragging(true);

                // Record starting positions
                dragStartRef.current = {
                    x: position.x,
                    y: position.y,
                    clientX,
                    clientY,
                };

                // Stop any animations
                cancelAnimation();

                // Return something as memo to track this drag from start
                return Date.now();
            }

            // While dragging
            if (active) {
                // Calculate how far we've moved
                const dx = clientX - dragStartRef.current.clientX;
                const dy = clientY - dragStartRef.current.clientY;

                // Update position directly for immediate feedback
                setPosition({
                    x: dragStartRef.current.x + dx,
                    y: dragStartRef.current.y + dy,
                });
            }

            // On release
            if (last) {
                setIsDragging(false);

                // Update target position to current position
                targetRef.current = {
                    ...targetRef.current,
                    x: position.x,
                    y: position.y,
                };
            }

            // Pass along memo for tracking
            return memo;
        },
        {
            filterTaps: true,
            pointer: { touch: true }, // Enable touch support
            // Increase the drag threshold to avoid accidental drags
            threshold: 5,
            // Use passive: false to allow preventDefault to work properly
            eventOptions: { passive: false },
            // Capture events at the earliest phase
            capture: true,
        }
    );

    // Set up pinch gesture for touch zoom
    const bindPinch = usePinch(
        ({ active, first, last, offset: [d] }) => {
            // On pinch start
            if (first) {
                pinchRef.current.active = true;
                pinchRef.current.initialScale = scale;

                // Stop any animations
                cancelAnimation();
            }

            // During pinch
            if (active) {
                // Calculate new scale
                const newScale = Math.max(
                    minZoom,
                    Math.min(maxZoom, (pinchRef.current.initialScale * d) / 100)
                );

                // Update scale directly
                setScale(newScale);
            }

            // On pinch end
            if (last) {
                pinchRef.current.active = false;

                // Update target scale to current scale
                targetRef.current = {
                    ...targetRef.current,
                    scale: scale,
                };
            }
        },
        {
            pointer: { touch: true },
            // Use passive: false to allow preventDefault
            eventOptions: { passive: false },
            // Capture events at the earliest phase
            capture: true,
        }
    );

    // Set up wheel gesture for zooming
    const bindWheel = useWheel(
        ({ delta: [, dy], event }) => {
            // Skip if we're pinching
            if (pinchRef.current.active) return;

            event.preventDefault();

            // Calculate new scale
            const delta = dy * -0.002;
            const newScale = Math.max(
                minZoom,
                Math.min(maxZoom, scale + delta)
            );

            // Update scale directly for immediate feedback
            setScale(newScale);

            // Update target for smooth finish
            targetRef.current = {
                ...targetRef.current,
                scale: newScale,
            };

            // Start animation if needed for smooth effect
            if (animationRef.current === null && !isDragging) {
                animationRef.current = requestAnimationFrame(animate);
            }
        },
        {
            preventDefault: true,
            // Capture events at the earliest phase
            capture: true,
        }
    );

    // Helper function to reset view
    const resetView = useCallback(() => {
        // Cancel any existing animation
        cancelAnimation();

        // Set target to default position
        targetRef.current = {
            x: 0,
            y: 0,
            scale: 1,
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animate);
    }, [animate, cancelAnimation]);

    // Combine gesture bindings
    const combinedBindings = {
        ...bindDrag(),
        ...bindPinch(),
    };

    return {
        bindDrag: () => combinedBindings,
        bindWheel,
        resetView,
        // Return current transform values directly
        x: position.x,
        y: position.y,
        scale: scale,
    };
};
