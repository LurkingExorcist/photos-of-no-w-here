export const normalizeHex = (hex: string) => hex.slice(1, hex.length);

export const splitHex = (hex: string) => [
  hex.slice(0, 2),
  hex.slice(2, 4),
  hex.slice(4, 6),
];

export const diffHex = (hex1: string, hex2: string) => {
  const [parts1, parts2] = [splitHex(hex1), splitHex(hex2)];

  let diff = 0;

  for (let i = 0; i < parts1.length; i++) {
    diff += Math.abs(parseInt(parts1[i], 16) - parseInt(parts2[i], 16));
  }

  return diff;
};
