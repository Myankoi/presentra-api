import { Router } from "express";
import { getMyProfile, createUser, bulkImportUsers } from "../controllers/user.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/index.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Profile — any authenticated user
router.get("/me", authMiddleware, getMyProfile);

// Single user creation — admin only
router.post("/", authMiddleware, roleMiddleware(["admin"]), createUser);

// Bulk import via Excel — admin only
router.post(
    "/bulk-import",
    authMiddleware,
    roleMiddleware(["admin"]),
    upload.single("file"),
    bulkImportUsers
);

export default router;