import { Router } from "express";
import { getEventsController, getEventLocationsController } from "../controllers/event.controller.js";

const router = Router();

router.get("/", getEventsController);
router.get("/locations", getEventLocationsController);


export default router;