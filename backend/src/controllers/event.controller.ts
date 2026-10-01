import { Request, Response } from "express";
import { getEventsService } from "../services/event.service.js";

export const getEventsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const events = await getEventsService();

   const serializedEvents = events.map((event) => ({
  ...event,
  id: event.id.toString(),
  organizerId: event.organizerId.toString(),
  categoryId: event.categoryId.toString(),
  category: {
    ...event.category,
    id: event.category.id.toString(),
  },
}));

    res.status(200).json({
      data: serializedEvents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get events",
    });
  }
};