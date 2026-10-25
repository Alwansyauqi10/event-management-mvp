import type { Request, Response } from "express";
import {
  createEventReviewService,
  getEventReviewsService,
  getOrganizerReviewsService,
} from "../services/eventReview.service.js";

const isValidId = (id: unknown): id is string =>
  typeof id === "string" && /^[1-9]\d*$/.test(id);

export const createEventReviewController = async (
  req: Request,
  res: Response,
) => {
  const userId = res.locals.user?.id;
  const transactionId = req.params.transactionId;
  const { rating, comment } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Silakan login terlebih dahulu" });
    return;
  }

  if (!isValidId(transactionId)) {
    res.status(400).json({ message: "ID transaksi tidak valid" });
    return;
  }

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    res.status(400).json({
      message: "Rating harus berupa bilangan bulat dari 1 sampai 5",
    });
    return;
  }

  if (
    comment !== undefined &&
    (typeof comment !== "string" || comment.length > 5000)
  ) {
    res.status(400).json({
      message: "Komentar harus berupa teks maksimal 5000 karakter",
    });
    return;
  }

  const result = await createEventReviewService({
    userId: BigInt(userId),
    transactionId: BigInt(transactionId),
    rating,
    comment,
  });

  res.status(201).json({
    message: "Review berhasil dikirim",
    data: {
      ...result,
      id: result.id.toString(),
      user: {
        id: result.user.id.toString(),
        name: result.user.name,
      },
    },
  });
};

export const getEventReviewsController = async (
  req: Request,
  res: Response,
) => {
  const eventId = req.params.eventId;

  if (!isValidId(eventId)) {
    res.status(400).json({ message: "ID event tidak valid" });
    return;
  }

  const result = await getEventReviewsService(BigInt(eventId));

  res.status(200).json({
    message: "Review event berhasil diambil",
    data: result,
  });
};

export const getOrganizerReviewsController = async (
  req: Request,
  res: Response,
) => {
  const organizerId = req.params.organizerId;

  if (!isValidId(organizerId)) {
    res.status(400).json({
      message: "ID organizer tidak valid",
    });
    return;
  }

  const result = await getOrganizerReviewsService(
    BigInt(organizerId),
  );

  res.status(200).json({
    message: "Review organizer berhasil diambil",
    data: result,
  });
};