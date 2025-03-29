/**
 * Animation utility functions for the grid system
 */

import type { GridPosition } from '../types/grid';

/**
 * Interface for animation target values
 */
export interface AnimationTarget {
    x: number;
    y: number;
    scale: number;
}

/**
 * Determines if we've reached the target position within specified thresholds
 * @param current - Current position and scale
 * @param target - Target position and scale
 * @returns Object with boolean flags for each dimension
 */
export const isAtTarget = (
    current: { x: number; y: number; scale: number },
    target: { x: number; y: number; scale: number }
): { isXDone: boolean; isYDone: boolean; isScaleDone: boolean } => {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dScale = target.scale - current.scale;

    return {
        isXDone: Math.abs(dx) < 0.5,
        isYDone: Math.abs(dy) < 0.5,
        isScaleDone: Math.abs(dScale) < 0.001, // More sensitive threshold for scale
    };
};

/**
 * Calculates the next animation step with easing
 * @param current - Current position and scale
 * @param target - Target position and scale
 * @returns New position and scale values with easing applied
 */
export const calculateNextAnimationStep = (
    current: { x: number; y: number; scale: number },
    target: { x: number; y: number; scale: number }
): { newPosition: GridPosition; newScale: number } => {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dScale = target.scale - current.scale;

    const positionEase = 0.15; // Easing for position
    const scaleEase = 0.1; // Separate easing for scale

    return {
        newPosition: {
            x: current.x + dx * positionEase,
            y: current.y + dy * positionEase,
        },
        newScale: current.scale + dScale * scaleEase,
    };
};

/**
 * Constrains a scale value between min and max bounds
 * @param scale - Current scale value
 * @param minZoom - Minimum allowed zoom level
 * @param maxZoom - Maximum allowed zoom level
 * @returns Constrained scale value
 */
export const constrainScale = (
    scale: number,
    minZoom: number,
    maxZoom: number
): number => {
    return Math.max(minZoom, Math.min(maxZoom, scale));
};
