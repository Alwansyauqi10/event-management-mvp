import { Router } from "express";
import {
  getOrganizerPublicEventsController,
  getOrganizerPublicProfileController,
} from "../controllers/organizerProfile.controller.js";

const router = Router();

router.get("/:id/events", getOrganizerPublicEventsController);
router.get("/:id", getOrganizerPublicProfileController);

export default router;