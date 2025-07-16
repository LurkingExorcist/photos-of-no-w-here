export interface GridCellDatum {
    color: string;
    saturation: number;
    saturationNoiseValue: string;
    lightness: number;
    lightnessNoiseValue: string;
    photoUrl: string | null;
}

export interface Chunk {
    x: number;
    y: number;
    cells: GridCellDatum[][];
}

export interface GridPosition {
    x: number;
    y: number;
}
