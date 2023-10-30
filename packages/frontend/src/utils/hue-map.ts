import { Count } from "@/types";

export const generateHueMap = (options: {
  count: Count;
  initialValue: number;
}) => {
  const matrix: number[][] = [];

  for (let y = 0; y < options.count.y; y++) {
    matrix.push(Array.from({length: options.count.x}, () => 0));
    for (let x = 0; x < options.count.x; x++) {
      if (x === 0) {
        if (y === 0) {
          matrix[y][x] = options.initialValue;
          continue;
        }

        matrix[y][x] = (options.initialValue + 90 * y) % 360;
        continue;
      }

      if (y === 0) {
        matrix[y][x] = options.initialValue + 30 * x;
        continue;
      }

      matrix[y][x] = (360 - (matrix[y][x-1] - matrix[y-1][x-1])) / 2;
      continue;
    }
  }

  return matrix;
}
