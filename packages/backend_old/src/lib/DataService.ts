import fs from "fs";
import path from "path";

const cachePath = path.resolve("cache.json");

export class DataService {
  private cache: Record<string, string[]>;

  constructor() {
    this.cache = this.getCache();
  }

  public get(key: string, defaultValue?: string[]) {
    return this.cache[key] || defaultValue || null;
  }

  public set(key: string, value: string[]) {
    this.cache[key] = value;

    return this;
  }

  public update() {
    fs.writeFileSync(cachePath, JSON.stringify(this.cache, null, 2));
  }

  public processImages() {
    for (let colorValue = 0; colorValue < 256 ** 3; colorValue++) {
      const hex = colorValue.toString(16).padStart(6, "0");

      console.log("Color: " + hex);

      const { media } = medias.reduce<{ media: Media | null; diff: number }>(
        (acc, media) => {
          if (!acc.media) {
            return {
              media,
              diff: diffHex(hex, normalizeHex(media.average_color!)),
            };
          }
          const diff1 = diffHex(hex, normalizeHex(acc.media.average_color!));

          const diff2 = diffHex(hex, normalizeHex(media.average_color!));

          if (diff2 < diff1) {
            return { media, diff: diff2 };
          }

          return acc;
        },
        { media: null, diff: Infinity }
      );

      const cachedPaths = cache.get(hex, []);

      if (media && !cachedPaths.includes(media.uri)) {
        cache.set(hex, [...cachedPaths, media.uri]);
      }
    }
  }

  private getCache() {
    if (!fs.existsSync(cachePath)) {
      fs.writeFileSync(cachePath, "{}");
      return {};
    }

    return JSON.parse(fs.readFileSync(cachePath, { encoding: "utf8" }));
  }
}
