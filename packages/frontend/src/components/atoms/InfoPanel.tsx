import React from 'react';

interface InfoPanelProps {
    children: React.ReactNode;
    className?: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    children,
    className = '',
}) => {
    return (
        <div
            className={`px-3 py-1.5 bg-white bg-opacity-80 text-gray-800 rounded-md shadow-md ${className}`}
        >
            {children}
        </div>
    );
};
