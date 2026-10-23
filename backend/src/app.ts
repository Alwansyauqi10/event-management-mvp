import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { globalError, notFoundError } from "./utils/error.js";
import { referralRoutes } from "./routes/referral.routes.js";
import organizerRouter from "./routes/organizerDashboard.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import paymentProofRouter from "./routes/payment-proof.routes.js";
import checkInRouter from "./routes/checkIn.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);
app.use("/auth", authRoutes);
app.use("/referral", referralRoutes);
app.use("/organizer", organizerRouter);
app.use("/transactions", transactionRouter);
app.use("/transactions", paymentProofRouter);
app.use("/organizer", organizerRouter);
app.use("/organizer", checkInRouter);

app.get("/", (req, res) => {
  res.json({ message: "Event Management API is running" });
});

app.use(globalError);
app.use(notFoundError);

export default app;
