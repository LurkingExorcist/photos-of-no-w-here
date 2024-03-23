import { Router } from "express";
import path from "path";
import busboy from "connect-busboy";
import fs from "fs";
import afs from "fs/promises";
import decompress from "decompress";
import sharp from "sharp";
import { getAverageColor } from "fast-average-color-node";
import { Media, Post } from "../posts";
import { DataService } from "../../lib";
import { diffHex, normalizeHex } from "../image/utls";

const cache = new DataService();

export const dataRouter = Router();

dataRouter.use(
  busboy({
    highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
  })
); // Insert the busboy middle-ware

const UPLOAD_PATH = path.resolve("temp"); // Register the upload path

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH);
}

const DATA_PATH = path.resolve("data"); // Register the data path

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}

dataRouter.get("/upload", (req, res) => {
  res.sendFile(path.resolve("src/view/data/upload.html"));
});

dataRouter.post("/upload", (req, res) => {
  req.pipe(req.busboy); // Pipe it trough busboy

  req.busboy.on("file", (fieldname, file, { filename }) => {
    if (!filename.endsWith(".zip")) {
      res.status(400).json({
        success: false,
        data: {
          message: "Zip file is required.",
        },
      });

      return;
    }

    const filePath = path.join(UPLOAD_PATH, filename);

    console.log(`Upload of '${filename}' started`);

    const fstream = fs.createWriteStream(filePath);
    file.pipe(fstream);

    fstream.on("close", async () => {
      console.log(`Upload of '${filename}' finished`);

      console.log(`Decompressing of '${filename}' started...`);

      await decompress(filePath, DATA_PATH);

      console.log(`Decompressing of '${filename}' finished`);

      console.log(`Deleting of '${filename}' started...`);

      fs.rmSync(filePath);

      console.log(`Deleting of '${filename}' finished`);

      const postsPath = path.resolve(
        "data/your_instagram_activity/content/posts_1.json"
      );

      console.log("Posts are processing now...");

      const posts: Post[] = await afs
        .readFile(postsPath, { encoding: "utf8" })
        .then((module) => JSON.parse(module));

      const medias: Media[] = [];

      for (let i = 0; i < posts.length; i++) {
        const {
          media: [media],
        } = posts[i];

        let postPath = path.resolve(DATA_PATH, media.uri);
        const match = postPath.match(/(.+)\/(.+)\.(\w+)$/);

        if (!match) {
          throw new Error(`Path ${postPath} doesn't fit to match pattern`);
        }

        const [_full, location, name, ext] = match;

        if (ext === "mp4") {
          continue;
        }

        media.uri = `${location}/${name}.webp`;
        console.log(`Processing file: ${media.uri}...`);

        switch (ext) {
          case "jpg":
          case "jpeg":
          case "heic":
            await sharp(postPath).jpeg().toFile(media.uri);

            console.log(`Extension is changed for: ${media.uri}`);

            postPath = path.resolve(DATA_PATH, media.uri);
            break;
        }

        const color = await getAverageColor(postPath);
        media.average_color = color.hex;

        medias.push(media);
      }

      console.log("Starting caching...");


      console.log("Caching is complete");

      console.log("Overriding old posts data...");

      await afs.writeFile(postsPath, JSON.stringify(posts));

      console.log("Overriding complete");

      console.log("Updating the cache...");

      cache.update();

      console.log("Cache is updated");

      res.json({
        success: true,
      });
    });
  });
});

dataRouter.get("/posts", (req, res) => {
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

  res.sendFile(postsPath);
});
