import { Router } from "express";
import { getMyProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authMiddleware, getMyProfile);

export default router;