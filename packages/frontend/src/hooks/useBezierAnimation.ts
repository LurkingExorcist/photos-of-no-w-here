import { useCallback } from 'react';

/**
 * Hook for creating smooth bezier curve animations with cubic easing
 */
export const useBezierAnimation = () => {
    /**
     * Cubic bezier easing function
     * Implements a cubic bezier curve with control points (0.25, 0.1, 0.25, 1.0)
     * This creates a smooth acceleration/deceleration curve
     */
    const bezierEasing = useCallback((t: number): number => {
        // Using the standard parametric bezier formula with control points (0.25, 0.1, 0.25, 1.0)
        return (
            3 * t * (1 - t) * (1 - t) * 0.1 + // First control point y-value: 0.1
            3 * t * t * (1 - t) * 0.25 + // Second control point y-value: 0.25
            t * t * t // End point is (1,1)
        );
    }, []);

    /**
     * Starts a bezier-interpolated animation
     * @param options Animation options
     * @param options.duration Animation duration in milliseconds
     * @param options.onUpdate Callback function for each animation frame with progress (0-1)
     * @param options.onComplete Optional callback when animation completes
     * @returns Function to cancel the animation
     */
    const animate = useCallback(
        ({
            duration = 500,
            onUpdate,
            onComplete,
        }: {
            duration?: number;
            onUpdate: (progress: number) => void;
            onComplete?: () => void;
        }) => {
            let animationFrameId: number;
            let startTime: number | null = null;

            const animationFrame = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;

                // Calculate linear progress (0 to 1)
                const progress = Math.min(elapsed / duration, 1);

                // Apply bezier easing to get smooth acceleration/deceleration
                const easedProgress = bezierEasing(progress);

                // Update with eased progress value
                onUpdate(easedProgress);

                // Continue animation if not complete
                if (progress < 1) {
                    animationFrameId = requestAnimationFrame(animationFrame);
                } else if (onComplete) {
                    onComplete();
                }
            };

            // Start animation
            animationFrameId = requestAnimationFrame(animationFrame);

            // Return cancel function for cleanup
            return () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
            };
        },
        [bezierEasing]
    );

    return { animate, bezierEasing };
};
