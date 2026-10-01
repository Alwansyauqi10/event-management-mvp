import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Event Management API is running" });
});

export default app;