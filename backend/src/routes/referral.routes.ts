import express from "express";
import {
  myCouponsController,
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

referralRoutes.get(
  "/coupons",
  verifyToken(process.env.JWT_SECRET!),
  myCouponsController,
);
export { referralRoutes };
