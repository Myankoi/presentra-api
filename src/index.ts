import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import "./config/firebase.js";
import userRoutes from "./routes/user.routes.js";
import { authMiddleware, roleMiddleware, errorMiddleware } from "./middlewares/index.js";
import absenRoutes from "./routes/absen.routes.js";
import jadwalRoutes from "./routes/jadwal.routes.js";
import piketRoutes from "./routes/piket.routes.js";
import { initAttendanceReminder } from "./tasks/attendance-reminder.task.js";
import laporanRoutes from "./routes/laporan.routes.js";
import bkRoutes from "./routes/bk.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/absen", absenRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/piket", piketRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/bk", bkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

initAttendanceReminder();

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server nyala woi http://localhost:${port}`);
});