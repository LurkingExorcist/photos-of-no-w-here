import "dotenv/config";

import { BACKEND_PORT } from '@photos-of-no-w-here/config';
import express from "express";
import cors from "cors";

import { router } from "./router";

const app = express();

app.use(cors());

app.use(router);

app.listen(BACKEND_PORT, () =>
  console.info(
    `rocks are quiet because trees are listening on port ${BACKEND_PORT}`
  )
);
