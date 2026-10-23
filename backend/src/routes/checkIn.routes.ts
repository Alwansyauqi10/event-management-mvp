
import { Router } from "express";
import { checkRole } from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  checkInTransactionController,
  getCheckInAttendeesController,
} from "../controllers/checkIn.controller.js";

const checkInRouter = Router();

checkInRouter.use(
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
);

checkInRouter.get(
  "/events/:eventId/check-in-attendees",
  getCheckInAttendeesController,
);

checkInRouter.post(
  "/transactions/:transactionId/check-in",
  checkInTransactionController,
);

export default checkInRouter;
