export type With<A, B> = A & B;

export type Position = {
  x: number;
  y: number;
};

export type Position3D = {
  x: number;
  y: number;
  z: number;
};

export type Box = {
  width: number;
  height: number;
};

export type SpaceBox = With<Box, Position>;

export type HSL = {
  hue: number;
  saturation: number;
  lightness: number;
}

export type Count = {
  x: number;
  y: number;
  total: number;
}