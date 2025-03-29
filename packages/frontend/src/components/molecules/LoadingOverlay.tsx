import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
}) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-gray-800">Loading grid...</p>
            </div>
        </div>
    );
};
