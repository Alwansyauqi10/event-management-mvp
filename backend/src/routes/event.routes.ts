import { Router } from "express";
import {
  getEventsController,
  getEventLocationsController,
  getEventByIdController,
  getEventTicketsController,
} from "../controllers/event.controller.js";

const router = Router();

router.get("/", getEventsController);
router.get("/locations", getEventLocationsController);
router.get("/:id/tickets", getEventTicketsController);
router.get("/:id", getEventByIdController);



export default router;