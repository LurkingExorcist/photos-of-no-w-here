/**
 * Interface for noise generators that provide a noise function
 */
export interface INoiseGenerator {
    noise(x: number, y: number, z?: number): number;
}
