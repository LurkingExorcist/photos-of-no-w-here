/**
 * Perlin Noise Generator
 *
 * A class that implements the Perlin noise algorithm, which generates smooth
 * pseudo-random gradients that can be used for procedural texture generation,
 * terrain creation, and other visual effects.
 *
 * This implementation supports 1D, 2D, and 3D noise generation with a
 * customizable seed value for reproducible results.
 *
 * @example
 * const noise = new PerlinNoise(42); // Create with seed 42
 * const value = noise.noise(x, y); // Get 2D noise value at coordinates (x,y)
 */
export class PerlinNoise {
    // The original permutation table (size 256)
    private readonly permutation: number[];
    // Doubled permutation table (size 512) to avoid overflow issues
    private readonly p: number[];

    /**
     * Creates a new Perlin noise generator with the given seed
     *
     * @param seed - A number used to initialize the pseudo-random permutation
     * table, ensuring reproducible noise patterns for the same seed value
     */
    constructor(seed: number) {
        // Initialize permutation array with values 0-255
        // This array will be shuffled to create the pseudo-random gradient indices
        this.permutation = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }

        // Fisher-Yates shuffle algorithm with seed-based randomization
        // This creates a reproducible but random-seeming permutation
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(this.seededRandom(seed) * (i + 1));
            // Swap elements i and j
            [this.permutation[i], this.permutation[j]] = [
                this.permutation[j],
                this.permutation[i],
            ];
        }

        // Double the permutation array to avoid the need for index wrapping
        // This simplifies lookups in the noise function
        this.p = [...this.permutation, ...this.permutation];
    }

    /**
     * Generates a Perlin noise value at the specified coordinates
     *
     * @param x - X coordinate in noise space
     * @param y - Y coordinate in noise space
     * @param z - Z coordinate in noise space (defaults to 0 for 2D noise)
     * @returns A noise value in the approximate range [-1, 1]
     */
    public noise(x: number, y: number, z: number = 0): number {
        // Convert the coordinates to grid cell coordinates
        // The & 255 operation is equivalent to modulo 256 but faster
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        // Calculate the relative coordinates within the grid cell (0 to 1)
        // These are the fractional parts of the input coordinates
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        // Apply the fade function to the relative coordinates
        // This creates smooth transitions between grid cells (ease curve)
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        // Calculate hash values for the 8 cube corners
        // These are used to determine gradient vectors for interpolation
        const A = this.p[X] + Y; // Hash for the top-left corner of bottom face
        const AA = this.p[A] + Z; // Hash for bottom-left-front corner
        const AB = this.p[A + 1] + Z; // Hash for bottom-left-back corner
        const B = this.p[X + 1] + Y; // Hash for the top-right corner of bottom face
        const BA = this.p[B] + Z; // Hash for bottom-right-front corner
        const BB = this.p[B + 1] + Z; // Hash for bottom-right-back corner

        // Perform trilinear interpolation between the 8 corner gradients
        // This is the core of the Perlin noise algorithm, blending the corner
        // values based on the fade curves and gradient dot products
        return this.lerp(
            w, // Interpolate along z-axis
            this.lerp(
                v, // Interpolate along y-axis for the z=0 plane
                this.lerp(
                    u, // Interpolate along x-axis for y=0, z=0 line
                    this.grad(this.p[AA], x, y, z), // Bottom-left-front corner gradient
                    this.grad(this.p[BA], x - 1, y, z) // Bottom-right-front corner gradient
                ),
                this.lerp(
                    u, // Interpolate along x-axis for y=1, z=0 line
                    this.grad(this.p[AB], x, y - 1, z), // Top-left-front corner gradient
                    this.grad(this.p[BB], x - 1, y - 1, z) // Top-right-front corner gradient
                )
            ),
            this.lerp(
                v, // Interpolate along y-axis for the z=1 plane
                this.lerp(
                    u, // Interpolate along x-axis for y=0, z=1 line
                    this.grad(this.p[AA + 1], x, y, z - 1), // Bottom-left-back corner gradient
                    this.grad(this.p[BA + 1], x - 1, y, z - 1) // Bottom-right-back corner gradient
                ),
                this.lerp(
                    u, // Interpolate along x-axis for y=1, z=1 line
                    this.grad(this.p[AB + 1], x, y - 1, z - 1), // Top-left-back corner gradient
                    this.grad(this.p[BB + 1], x - 1, y - 1, z - 1) // Top-right-back corner gradient
                )
            )
        );
    }

    /**
     * Generates a deterministic pseudo-random number based on a seed
     * This is used to shuffle the permutation table in a reproducible way
     *
     * @param seed - The seed value
     * @returns A pseudo-random number between 0 and 1
     */
    private seededRandom(seed: number): number {
        // Using sine function to generate pseudo-random values
        // Multiplying by 10000 spreads the values more evenly
        const x = Math.sin(seed++) * 10000;
        // Extract just the fractional part to get a value between 0 and 1
        return x - Math.floor(x);
    }

    /**
     * Smoothing function that creates an S-curve with derivatives of 0 at t=0 and t=1
     * This is Ken Perlin's improved "quintic" smoothing function: 6t^5 - 15t^4 + 10t^3
     *
     * @param t - Input value (typically between 0 and 1)
     * @returns Smoothed value with the same range
     */
    private fade(t: number): number {
        // The polynomial t * t * t * (t * (t * 6 - 15) + 10) creates a smooth
        // S-curve that approaches 0 and 1 with a zero derivative, ensuring smooth transitions
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Linear interpolation between two values based on a weighting factor
     *
     * @param t - The interpolation parameter (typically between 0 and 1)
     * @param a - The first value (returned when t = 0)
     * @param b - The second value (returned when t = 1)
     * @returns The interpolated value: a + t(b-a)
     */
    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    /**
     * Computes the dot product of a pseudo-random gradient vector and a distance vector
     * This is a clever optimization from Ken Perlin that avoids explicitly using
     * normalized gradient vectors
     *
     * @param hash - A hash value used to determine the gradient vector
     * @param x - X component of the distance vector
     * @param y - Y component of the distance vector
     * @param z - Z component of the distance vector
     * @returns The dot product of the gradient and distance vectors
     */
    private grad(hash: number, x: number, y: number, z: number): number {
        // Reduce hash to 4 bits (0-15) to select one of 16 gradient directions
        const h = hash & 15;

        // Select either x or y based on the hash
        const u = h < 8 ? x : y;

        // Select either y, x, or z based on the hash
        // This creates a set of 12 possible gradient vectors where each component is either -1, 0, or 1
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;

        // Determine the sign of u and v based on the hash bits
        // (h & 1) extracts the 1st bit, (h & 2) extracts the 2nd bit
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}
