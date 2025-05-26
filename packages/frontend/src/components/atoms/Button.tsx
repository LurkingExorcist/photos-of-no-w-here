import React from 'react';

import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <button
            type="button"
            className={`cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
