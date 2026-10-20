import { Router } from "express";
import {
  getEventsController,
  getEventLocationsController,
  getEventByIdController,
  getEventTicketsController,
  getEventCategoriesController,
  getOrganizerEventsController,
} from "../controllers/event.controller.js";

import { createEventController } from "../controllers/event.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import { uploadEventImage } from "../middleware/event-upload.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import { createEventSchema } from "../validator/event.validator.js";

const router = Router();

router.post(
  "/",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  uploadEventImage,
  validate(createEventSchema),
  createEventController,
);

router.get(
  "/organizer",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  getOrganizerEventsController,
);

router.get("/categories", getEventCategoriesController);
router.get("/", getEventsController);
router.get("/locations", getEventLocationsController);
router.get("/:id/tickets", getEventTicketsController);
router.get("/:id", getEventByIdController);

export default router;
