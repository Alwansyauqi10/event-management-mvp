import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { globalError, notFoundError } from "./utils/error.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Event Management API is running" });
});

app.use(globalError);
app.use(notFoundError);

export default app;
