import { Router } from "express";
import fs from "fs";
import afs from "fs/promises";
import { Media, Post } from "../posts";
import path from "path";
import { diffHex, normalizeHex } from "./utls";
import { DataService, Picker } from "../../lib";

const DATA_PATH = path.resolve("data"); // Register the data path

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}

const cache = new DataService();

export const imageRouter = Router();

imageRouter.get("/:color", async (req, res) => {
  const { color } = req.params;

  if (color.length !== 6) {
    res.status(400).json({
      success: false,
      data: {
        message: "Color should be hex",
      },
    });
  }

  const cachedPaths = cache.get(color);

  if (cachedPaths) {
    res.sendFile(new Picker(cachedPaths).random());
    return;
  } else {
    res.status(400).json({
      success: false,
      data: {
        message: "Media is not found",
      },
    });
    return;
  }
});
