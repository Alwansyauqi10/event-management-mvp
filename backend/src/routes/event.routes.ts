import { Router } from "express";
import { getEventsController, getEventLocationsController, getEventByIdController } from "../controllers/event.controller.js";

const router = Router();

router.get("/", getEventsController);
router.get("/locations", getEventLocationsController);
router.get("/:id", getEventByIdController);



export default router;