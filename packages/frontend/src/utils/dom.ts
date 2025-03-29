/**
 * Utility functions for DOM manipulation and optimization
 */

/**
 * Safely handles common event operations like preventDefault and stopPropagation
 * @param event - DOM event object
 */
export const preventDefaultAndStopPropagation = (event: {
    stopPropagation: () => void;
    preventDefault: () => void;
}): void => {
    event.stopPropagation();
    event.preventDefault();
};

/**
 * Creates an IntersectionObserver with specified options
 *
 * @param callback - Function to call when intersection status changes
 * @param options - Configuration options for the observer
 * @returns IntersectionObserver instance
 */
export const createIntersectionObserver = (
    callback: (isIntersecting: boolean) => void,
    options: IntersectionObserverInit = {}
): IntersectionObserver => {
    return new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry) {
            callback(entry.isIntersecting);
        }
    }, options);
};
