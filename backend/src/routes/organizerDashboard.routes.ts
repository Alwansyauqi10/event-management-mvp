import { Router } from "express";
import { checkRole } from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  acceptOrganizerTransactionController,
  getOrganizerTransactionDetailController,
  getOrganizerTransactionsController,
  organizerDashboardController,
  rejectOrganizerTransactionController,
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

organizerRouter.get(
  "/transactions/:transactionId",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  getOrganizerTransactionDetailController,
);
organizerRouter.put(
  "/transactions/:transactionId/accept",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  acceptOrganizerTransactionController,
);
organizerRouter.put(
  "/transactions/:transactionId/reject",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  rejectOrganizerTransactionController,
);
export default organizerRouter;
