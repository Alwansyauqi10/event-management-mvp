import { Request, Response } from "express";
import {
  getEventsService,
  getEventLocationsService,
  getEventByIdService,
  getEventTicketsService,
} from "../services/event.service.js";

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

export const getEventByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;

    if (typeof idParam !== "string") {
      res.status(400).json({
        message: "Invalid event id",
      });
      return;
    }

    const id = BigInt(idParam);

    const event = await getEventByIdService(id);

    if (!event) {
      res.status(404).json({
        message: "Event not found",
      });
      return;
    }

    const serializedEvent = {
      ...event,
      id: event.id.toString(),
      organizerId: event.organizerId.toString(),
      categoryId: event.categoryId.toString(),
      category: {
        ...event.category,
        id: event.category.id.toString(),
      },
    };

    res.status(200).json({
      data: serializedEvent,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get event",
    });
  }
};

export const getEventTicketsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const idParam = req.params.id;

    if (typeof idParam !== "string" || !/^\d+$/.test(idParam)) {
      res.status(400).json({
        message: "Invalid event id",
      });
      return;
    }

    const eventId = BigInt(idParam);

    const event = await getEventByIdService(eventId);

    if (!event) {
      res.status(404).json({
        message: "Event not found",
      });
      return;
    }

    const tickets = await getEventTicketsService(eventId);

    const serializedTickets = tickets.map((ticket) => ({
      ...ticket,
      id: ticket.id.toString(),
      eventId: ticket.eventId.toString(),
      price: ticket.price.toString(),
    }));

    res.status(200).json({
      data: serializedTickets,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get event tickets",
    });
  }
};
