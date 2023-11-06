import fs from "fs";
import path from "path";

const cachePath = path.resolve("cache.json");

export class CacheService {
  private cache: Record<string, unknown>;

  constructor() {
    this.cache = this.getCache();
  }

  public get<V>(key: string): V | null {
    return (this.cache[key] || null) as V | null;
  }

  public set<V>(key: string, value: V) {
    this.cache[key] = value;

    fs.writeFileSync(cachePath, JSON.stringify(this.cache, null, 2));
  }

  private getCache() {
    if (!fs.existsSync(cachePath)) {
      fs.writeFileSync(cachePath, "{}");
      return {};
    }

    return JSON.parse(fs.readFileSync(cachePath, { encoding: "utf8" }));
  }
}
