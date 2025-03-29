import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    ...attributes
}) => {
    return (
        <button
            className={`px-3 py-1.5 bg-white bg-opacity-80 text-gray-800 rounded-md hover:bg-opacity-100 transition-colors shadow-md ${className}`}
            type="button"
            {...attributes}
        >
            {children}
        </button>
    );
};
