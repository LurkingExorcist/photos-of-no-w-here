import { Router } from "express";
import { dataRouter, imageRouter } from "./domain";

export const router = Router();

router.use('/data', dataRouter);
router.use('/image', imageRouter);
