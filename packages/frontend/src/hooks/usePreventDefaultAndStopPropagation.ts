import { useCallback } from 'react';

/**
 * Hook that returns a callback to prevent default event behavior and stop propagation
 *
 * Useful for preventing browser default actions on various events
 *
 * @returns A function that can be used as an event handler
 */
export const usePreventDefaultAndStopPropagation = () => {
    return useCallback((event: Event | React.SyntheticEvent) => {
        if (!event) return;

        if (event.preventDefault) {
            event.preventDefault();
        }

        if (event.stopPropagation) {
            event.stopPropagation();
        }

        // For React synthetic events, persist the event for async operations
        if ('persist' in event && typeof event.persist === 'function') {
            event.persist();
        }
    }, []);
};
