import React from 'react';

import { Button, InfoPanel } from '../atoms';

interface ControlPanelProps {
    currentScale: number;
    x: number;
    y: number;
    isDragging: boolean;
    resetView: () => void;
    showHelp: boolean;
    toggleHelp: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    currentScale,
    x,
    y,
    isDragging,
    resetView,
    showHelp,
    toggleHelp,
}) => {
    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Button onClick={resetView}>Reset View</Button>
            <Button onClick={toggleHelp}>
                {showHelp ? 'Hide Help' : 'Show Help'}
            </Button>
            <InfoPanel className="text-xs">
                <div>Zoom: {currentScale.toFixed(2)}</div>
                <div>
                    Pan: [{x.toFixed(0)}, {y.toFixed(0)}]
                </div>
                <div className="text-xs mt-1">
                    {isDragging ? '✓ Dragging' : '✗ Not Dragging'}
                </div>
            </InfoPanel>
        </div>
    );
};
