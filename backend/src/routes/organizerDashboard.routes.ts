import { Router } from "express";
import { checkRole } from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getOrganizerTransactionsController,
  organizerDashboardController,
} from "../controllers/organizerDashboard.controller.js";

const organizerRouter = Router();
organizerRouter.get(
  "/dashboard",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  organizerDashboardController,
);
organizerRouter.get(
  "/transactions",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  getOrganizerTransactionsController,
);
export default organizerRouter;
