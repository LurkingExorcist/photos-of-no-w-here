import { v4 as uuidv4 } from 'uuid';

import { getColorPosition, getRandomColor } from '../utils/colorUtils';

import type { Photo } from '../types';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock photo API service
class PhotoService {
    // Fetch a photo by color
    public async fetchPhotoByColor(color: string): Promise<Photo> {
        // Simulate API delay
        await delay(1000 + Math.random() * 2000);

        // In a real app, this would be a call to an actual API
        // For now, we simulate the photo loading and return placeholder data
        const position = getColorPosition(color);

        return {
            id: uuidv4(),
            averageColor: color,
            url: `https://via.placeholder.com/400/${color.replace('#', '')}`, // Placeholder image with color
            x: position.x,
            y: position.y,
            isLoaded: true,
        };
    }

    // Generate random photos for testing
    public async generateRandomPhotos(count: number): Promise<Photo[]> {
        const photos: Photo[] = [];

        for (let i = 0; i < count; i++) {
            const color = getRandomColor();
            const position = getColorPosition(color);

            photos.push({
                id: uuidv4(),
                averageColor: color,
                url: null, // Will be loaded later
                x: position.x,
                y: position.y,
                isLoaded: false,
            });
        }

        return photos;
    }
}

export default new PhotoService();
