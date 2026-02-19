import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import "./config/firebase.js";
import userRoutes from "./routes/user.routes.js";
import { authMiddleware, roleMiddleware, errorMiddleware } from "./middlewares/index.js";
import absenRoutes from "./routes/absen.routes.js";
import jadwalRoutes from "./routes/jadwal.routes.js";


const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/absen", absenRoutes);
app.use("/api/jadwal", jadwalRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server nyala woi http://localhost:${port}`);
});