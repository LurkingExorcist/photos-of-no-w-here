export function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerp(a: number, b: number, t: number) {
  return (1 - t) * a + t * b;
}