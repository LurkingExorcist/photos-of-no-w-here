import { Router } from "express";
import fs from "fs";
import afs from "fs/promises";
import { Media, Post } from "../posts";
import path from "path";
import { diffHex, normalizeHex } from "./utls";
import { CacheService } from "../../lib";

const DATA_PATH = path.resolve("data"); // Register the data path

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}

const cache = new CacheService();

export const imageRouter = Router();

imageRouter.get("/:color", async (req, res) => {
  const { color } = req.params;

  const cachedPath = cache.get<string>(color);

  if (cachedPath) {
    res.sendFile(cachedPath);
    return;
  }
  
  if (color.length !== 6) {
    res.status(400).json({
      success: false,
      data: {
        message: "Color should be hex",
      },
    });
  }

  const postsPath = path.resolve("data/content/posts_1.json");

  if (!fs.existsSync(postsPath)) {
    res.status(404).json({
      success: false,
      data: {
        message: "Data is not provided",
      },
    });
    return;
  }

  const { media, diff } = await afs
    .readFile(postsPath, { encoding: "utf8" })
    .then((module): Post[] => JSON.parse(module))
    .then((data) =>
      data
        .map(({ media: [media] }) => media)
        .reduce<{ media: Media | null; diff: number }>(
          (acc, media) => {
            if (!acc.media) {
              return {
                media,
                diff: diffHex(color, normalizeHex(media.average_color!)),
              };
            }

            if (!acc.media.average_color) {
              throw new Error(`Color is not found for: ${acc.media.uri}`);
            }

            if (!media.average_color) {
              throw new Error(`Color is not found for: ${media.uri}`);
            }

            const diff1 = diffHex(
              color,
              normalizeHex(acc.media.average_color!)
            );

            const diff2 = diffHex(color, normalizeHex(media.average_color!));

            if (diff2 < diff1) {
              return { media, diff: diff2 };
            }

            return acc;
          },
          { media: null, diff: Infinity }
        )
    );

  if (!media) {
    res.status(400).json({
      success: false,
      data: {
        message: "Media is not found",
      },
    });
    return;
  }

  const postPath = path.resolve(DATA_PATH, media.uri);

  cache.set(color, postPath);

  res.sendFile(postPath);
});
