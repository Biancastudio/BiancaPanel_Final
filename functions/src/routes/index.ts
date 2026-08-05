import { Router } from "express";
import adminsRouter from "./admins.js";

const router = Router();

router.use("/", adminsRouter);

export default router;
