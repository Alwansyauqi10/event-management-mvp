import { Router } from "express";
import { checkRole } from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { organizerDashboardController } from "../controllers/organizerDashboard.controller.js";

const organizerRouter = Router();
organizerRouter.get(
  "/dashboard",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  organizerDashboardController,
);

export default organizerRouter;
