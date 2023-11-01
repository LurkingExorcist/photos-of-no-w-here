import { HSL } from "@/types";

export const HSLToRGB = (hsl: HSL) => {
  hsl.saturation /= 100;
  hsl.lightness /= 100;
  
  const k = (n: number) => (n + hsl.hue / 30) % 12;
  const a = hsl.saturation * Math.min(hsl.lightness, 1 - hsl.lightness);
  const f = (n: number) =>
    hsl.lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return [255 * f(0), 255 * f(8), 255 * f(4)]
    .map((v) => Math.floor(v).toString(16))
    .join("");
};
