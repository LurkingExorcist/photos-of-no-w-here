import React from 'react';

interface CrossIconProps {
    className?: string;
}

export const CrossIcon: React.FC<CrossIconProps> = ({ className = '' }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-12 w-12 ${className}`}
            fill="none"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    );
};
