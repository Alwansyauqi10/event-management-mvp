import express from "express";
import {
  myCouponsController,
  pointController,
  pointHistoryController,
  userCouponsController,
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
<<<<<<< HEAD
referralRoutes.get(
  "/coupons",
  verifyToken(process.env.JWT_SECRET!),
  userCouponsController,
);
=======

referralRoutes.get(
  "/coupons",
  verifyToken(process.env.JWT_SECRET!),
  myCouponsController,
);

>>>>>>> main
export { referralRoutes };
