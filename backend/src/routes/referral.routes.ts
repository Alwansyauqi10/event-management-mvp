import express from "express";
import {
  pointController,
  pointHistoryController,
} from "../controllers/referral.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const referralRoutes = express.Router();

referralRoutes.get(
  "/points",
  verifyToken(process.env.JWT_SECRET!),
  pointController,
);
referralRoutes.get(
  "/points/history",
  verifyToken(process.env.JWT_SECRET!),
  pointHistoryController,
);

export { referralRoutes };
