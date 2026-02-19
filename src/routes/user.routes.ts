import { Router } from "express";
import { getMyProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/index.js";

const router = Router();

router.get("/me", authMiddleware, getMyProfile);

export default router;