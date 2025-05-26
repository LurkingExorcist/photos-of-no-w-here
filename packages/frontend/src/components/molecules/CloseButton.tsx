import React, { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/Button';
import { CrossIcon } from '@/components/atoms/CrossIcon';

interface Position {
    x: number;
    y: number;
}

interface CloseButtonProps {
    className?: string;
    isPhotoSelected: boolean;
    position: Position;
    scale: number;
    translateTransitionDuration: number;
    updateIsPhotoSelected: (isSelected: boolean) => void;
    updatePosition: (position: Position) => void;
    updateScale: (scale: number) => void;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
    className = '',
    isPhotoSelected,
    position,
    scale,
    translateTransitionDuration,
    updateIsPhotoSelected,
    updatePosition,
    updateScale,
}) => {
    const refIsPhotoSelected = useRef(isPhotoSelected);

    const handleClose = () => {
        const targetPosition = {
            x: position.x / scale,
            y: position.y / scale,
        };

        const targetScale = 1.0;

        updatePosition(targetPosition);
        updateScale(targetScale);

        refIsPhotoSelected.current = false;

        // Wait for the transition to complete before allowing to continue dragging
        setTimeout(() => {
            updateIsPhotoSelected(false);
        }, translateTransitionDuration);
    };

    useEffect(() => {
        refIsPhotoSelected.current = isPhotoSelected;
    }, [isPhotoSelected]);

    return (
        <Button
            className={`
                absolute z-10 md:top-[8px] md:right-[calc((100vw-100vh)/2-54px)]
                top-[calc((100vh-100vw)/2-54px)] right-[8px]
                transition-opacity duration-[var(--translate-transition-duration)]
                bg-black rounded-lg
                ${refIsPhotoSelected.current ? 'opacity-75' : 'opacity-0 pointer-events-none'}
                ${className}
            `}
            onClick={handleClose}
        >
            <CrossIcon className="stroke-white" />
        </Button>
    );
};
