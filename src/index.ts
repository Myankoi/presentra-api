import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import "./config/firebase.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.listen(port, () => {
    console.log(`Server nyala woi http://localhost:${port}`);
});