import { useEffect, useRef, useState } from 'react';

import { createIntersectionObserver } from '@/utils/dom';

/**
 * Options for the intersection observer
 */
interface UseIntersectionObserverOptions {
    /** Margin around the root element for intersection detection */
    rootMargin?: string;
    /** Threshold at which the callback is triggered */
    threshold?: number[] | number;
    /** Root element to use as viewport for checking visibility */
    root?: Document | Element | null;
}

/**
 * Hook for detecting when an element becomes visible in the viewport
 *
 * Uses IntersectionObserver API to efficiently detect visibility changes
 *
 * @template T - Type of the HTML element to observe
 * @param options - Intersection observer configuration
 * @returns Tuple containing element ref and visibility state
 */
export const useIntersectionObserver = <T extends HTMLElement = HTMLDivElement>(
    options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] => {
    const { rootMargin = '0px', threshold = 0, root = null } = options;
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<T>(null);

    useEffect(() => {
        const currentElement = elementRef.current;
        if (!currentElement) return;

        // Create observer with our utility function
        const observer = createIntersectionObserver(
            (isIntersecting) => setIsVisible(isIntersecting),
            {
                root,
                rootMargin,
                threshold,
            }
        );

        // Start observing
        observer.observe(currentElement);

        // Cleanup on unmount
        return () => {
            observer.unobserve(currentElement);
        };
    }, [rootMargin, threshold, root]);

    return [elementRef, isVisible];
};
