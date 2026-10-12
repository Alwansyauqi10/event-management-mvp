import express from "express";
import { pointController } from "../controllers/referral.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const referralRoutes = express.Router();

referralRoutes.get(
  "/points",
  verifyToken(process.env.JWT_SECRET!),
  pointController,
);

export { referralRoutes };
