import { Router } from "express";
import {
  deleteEventController,
  getEventByIdController,
  getEventCategoriesController,
  getEventLocationsController,
  getEventsController,
  getEventTicketsController,
  updateEventController,
} from "../controllers/event.controller.js";

import { createEventController } from "../controllers/event.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { uploadEventImage } from "../middleware/event-upload.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validator/event.validator.js";

const router = Router();

router.post(
  "/",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  uploadEventImage,
  validate(createEventSchema),
  createEventController,
);

router.get("/categories", getEventCategoriesController);
router.get("/", getEventsController);
router.get("/locations", getEventLocationsController);
router.get("/:id/tickets", getEventTicketsController);
router.get("/:id", getEventByIdController);
router.patch(
  "/organizer/:eventId",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  uploadEventImage,
  validate(updateEventSchema),
  updateEventController,
);

router.delete(
  "/organizer/:eventId",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  deleteEventController,
);

export default router;
