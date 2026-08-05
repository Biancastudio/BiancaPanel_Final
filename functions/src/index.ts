import express from "express";
import cors from "cors";
import * as functions from "firebase-functions";

import adminRoutes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "BiancaPanel API funcionando",
  });
});

app.use("/admins", adminRoutes);

export const api = functions.https.onRequest(app);
