import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
  createEventReviewController,
  getEventReviewsController,
  getOrganizerReviewsController,
} from "../controllers/eventReview.controller.js";

const eventReviewRouter = Router();

// Endpoint publik: membaca review event
eventReviewRouter.get(
  "/events/:eventId",
  getEventReviewsController,
);

// Endpoint publik: membaca seluruh review organizer
eventReviewRouter.get(
  "/organizers/:organizerId",
  getOrganizerReviewsController,
);

// Endpoint customer: mengirim review setelah check-in
eventReviewRouter.post(
  "/transactions/:transactionId",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("CUSTOMER"),
  createEventReviewController,
);

export default eventReviewRouter;