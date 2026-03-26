import { Router } from "express";
import { getNotifications, getUnreadCount, markAsRead } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount); // Harus sebelum /:id
router.put("/:id/read", authMiddleware, markAsRead);

export default router;
