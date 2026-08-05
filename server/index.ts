import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import adminRoutes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "BiancaPanel API funcionando"
  });
});

app.use("/admins", adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
