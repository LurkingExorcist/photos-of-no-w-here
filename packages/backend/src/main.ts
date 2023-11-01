import "dotenv/config";

import express from "express";
import cors from "cors";

import { router } from "./router";

const app = express();

app.use(cors());

app.use(router);

app.listen(process.env.PORT, () =>
  console.info(
    `rocks are quiet because trees are listening on port ${process.env.PORT}`
  )
);
