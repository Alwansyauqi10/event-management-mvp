import { NextFunction, Request, Response } from "express";
import { cloudinary } from "../lib/cloudinary.js";
import {
  createEventService,
  deleteEventService,
  getEventByIdService,
  getEventCategoriesService,
  getEventLocationsService,
  getEventsService,
  getEventTicketsService,
  updateEventService,
} from "../services/event.service.js";
import { ApiError } from "../utils/api-error.js";

export const getEventsController = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;

    const location =
      typeof req.query.location === "string" ? req.query.location : undefined;

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 8;

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

export const getEventByIdController = async (req: Request, res: Response) => {
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
      organizer: {
        ...event.organizer,
        id: event.organizer.id.toString(),
      },
      tickets: event.tickets.map((ticket) => ({
        ...ticket,
        id: ticket.id.toString(),
        eventId: ticket.eventId.toString(),
        price: ticket.price.toString(),
      })),
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

export const getEventCategoriesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const categories = await getEventCategoriesService();

    const serializedCategories = categories.map((category) => ({
      ...category,
      id: category.id.toString(),
    }));

    res.status(200).json({
      data: serializedCategories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get event categories",
    });
  }
};

export const createEventController = async (req: Request, res: Response) => {
  try {
    const organizerId = res.locals.user?.id;

    if (!organizerId) {
      res.status(401).json({ message: "Silakan login terlebih dahulu" });
      return;
    }

    const {
      name,
      categoryId,
      location,
      startDate,
      endDate,
      description,
      tickets: ticketsJson,
    } = req.body;

    let parsedTickets: unknown;

    try {
      parsedTickets = JSON.parse(ticketsJson);
    } catch {
      res.status(400).json({ message: "Format data tiket tidak valid" });
      return;
    }

    if (!Array.isArray(parsedTickets) || parsedTickets.length === 0) {
      res.status(400).json({ message: "Minimal satu tipe tiket wajib diisi" });
      return;
    }

    const tickets = parsedTickets.map((ticket: unknown) => {
      if (!ticket || typeof ticket !== "object") {
        throw new Error("Data tiket tidak valid");
      }

      const item = ticket as Record<string, unknown>;
      const price = String(item.price ?? "");
      const quantity = Number(item.quantity);

      if (
        typeof item.name !== "string" ||
        !item.name.trim() ||
        !/^\d+$/.test(price) ||
        !Number.isSafeInteger(Number(price)) ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        throw new Error("Nama, harga, atau jumlah tiket tidak valid");
      }

      return {
        name: item.name.trim(),
        price,
        quantity,
      };
    });

    let imageUrl: string | null = null;

    if (req.file) {
      imageUrl = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "event-management/events",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(new Error("Upload poster gagal"));
              return;
            }

            resolve(result.secure_url);
          },
        );

        stream.end(req.file!.buffer);
      });
    }

    const event = await createEventService({
      organizerId: BigInt(organizerId),
      categoryId,
      name,
      description,
      location,
      startDate,
      endDate,
      image: imageUrl,
      tickets,
    });

    res.status(201).json({
      message: "Event berhasil dibuat",
      data: {
        id: event.id.toString(),
        organizerId: event.organizerId.toString(),
        categoryId: event.categoryId.toString(),
        name: event.name,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        availableSeats: event.availableSeats,
        status: event.status,
        image: event.image,
        category: {
          ...event.category,
          id: event.category.id.toString(),
        },
        tickets: event.tickets.map((ticket) => ({
          id: ticket.id.toString(),
          eventId: ticket.eventId.toString(),
          name: ticket.name,
          price: ticket.price.toString(),
          quantity: ticket.quantity,
          availableQuantity: ticket.availableQuantity,
        })),
      },
    });
  } catch (error) {
    console.error("Create event error:", error);

    res.status(400).json({
      message: error instanceof Error ? error.message : "Gagal membuat event",
    });
  }
};

export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const eventId = Array.isArray(req.params.eventId)
      ? req.params.eventId[0]
      : req.params.eventId;
    const organizerId = res.locals.user?.id;

    if (!eventId || !/^\d+$/.test(eventId)) {
      throw new ApiError("ID event tidak valid", 400);
    }

    if (!organizerId) {
      throw new ApiError("User tidak ditemukan", 401);
    }

    const tickets = JSON.parse(req.body.tickets);

    let imageUrl: string | undefined = undefined;

    if (req.file) {
      imageUrl = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "event-management/events",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(new Error("Upload poster gagal"));
              return;
            }

            resolve(result.secure_url);
          },
        );

        stream.end(req.file!.buffer);
      });
    }
    const event = await updateEventService({
      eventId: BigInt(eventId),
      organizerId: BigInt(organizerId),
      name: req.body.name,
      categoryId: req.body.categoryId,
      location: req.body.location,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      description: req.body.description,
      tickets,
      image: imageUrl,
    });

    res.status(200).json({
      message: "Event berhasil diperbarui",
      data: JSON.parse(
        JSON.stringify(event, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value,
        ),
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const eventId = Array.isArray(req.params.eventId)
      ? req.params.eventId[0]
      : req.params.eventId;
    const organizerId = res.locals.user?.id;

    if (!eventId || !/^\d+$/.test(eventId)) {
      throw new ApiError("ID event tidak valid", 400);
    }

    if (!organizerId) {
      throw new ApiError("User tidak ditemukan", 401);
    }

    const result = await deleteEventService(
      BigInt(organizerId),
      BigInt(eventId),
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
