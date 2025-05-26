// Photo types
export interface Photo {
    id: string;
    averageColor: string;
    url: string | null;
    x: number;
    y: number;
    isLoaded: boolean;
}

// Color metrics
export type ColorMetric = 'Lab' | 'RGB';

// Settings type
export interface Settings {
    colorMetric: ColorMetric;
}
