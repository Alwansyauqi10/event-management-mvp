import { Router } from "express";
import { checkRole } from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  acceptOrganizerTransactionController,
  getOrganizerEventAttendeesController,
  getOrganizerEventsController,
  getOrganizerTransactionDetailController,
  getOrganizerTransactionsController,
  organizerDashboardController,
  organizerDashboardStatisticsController,
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
organizerRouter.get(
  "/events",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  getOrganizerEventsController,
);

organizerRouter.get(
  "/events/:eventId/attendees",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  getOrganizerEventAttendeesController,
);
organizerRouter.get(
  "/dashboard/statistics",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  organizerDashboardStatisticsController,
);
export default organizerRouter;
