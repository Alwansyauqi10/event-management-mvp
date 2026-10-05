import { Request, Response } from "express";
import { getEventsService, getEventLocationsService } from "../services/event.service.js";

export const getEventsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const category =
      typeof req.query.category === "string"
        ? req.query.category
        : undefined;

    const location =
      typeof req.query.location === "string"
        ? req.query.location
        : undefined;

    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 8;

    const { events, total } = await getEventsService({
      search,
      category,
      location,
      page,
      limit,
    });

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

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: serializedEvents,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get events",
    });
  }
};

export const getEventLocationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const locations = await getEventLocationsService();

    res.status(200).json({
      data: locations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get event locations",
    });
  }
};