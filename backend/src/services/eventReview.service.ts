import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

export const createEventReviewService = async ({
  userId,
  transactionId,
  rating,
  comment,
}: {
  userId: bigint;
  transactionId: bigint;
  rating: number;
  comment?: string;
}) => {
  const transaction = await prisma.eventTransaction.findFirst({
    where: {
      id: transactionId,
      userId,
      status: "DONE",
      event: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
      eventId: true,
      checkedInAt: true,
      review: {
        select: { id: true },
      },
    },
  });

  if (!transaction) {
    throw new ApiError("Transaksi tidak ditemukan atau tidak memenuhi syarat", 404);
  }

  if (!transaction.checkedInAt) {
    throw new ApiError(
      "Kamu harus check-in sebelum memberikan review",
      403,
    );
  }

  if (transaction.review) {
    throw new ApiError("Transaksi ini sudah memiliki review", 409);
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      transaction: {
        eventId: transaction.eventId,
      },
    },
    select: { id: true },
  });

  if (existingReview) {
    throw new ApiError(
      "Kamu sudah memberikan review untuk event ini",
      409,
    );
  }

  return prisma.review.create({
    data: {
      transactionId: transaction.id,
      userId,
      rating,
      comment: comment?.trim() || null,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: {
        select: { id: true, name: true },
      },
    },
  });
};

export const getEventReviewsService = async (eventId: bigint) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
      location: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!event) {
    throw new ApiError("Event tidak ditemukan", 404);
  }

  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: {
        transaction: { eventId },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.review.aggregate({
      where: {
        transaction: { eventId },
      },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    event: {
      id: event.id.toString(),
      name: event.name,
      categoryId: event.categoryId.toString(),
      category: event.category,
      location: event.location,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
    },
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count.rating,
    reviews: reviews.map((review) => ({
      ...review,
      id: review.id.toString(),
      user: {
        id: review.user.id.toString(),
        name: review.user.name,
      },
    })),
  };
};

export const getOrganizerReviewsService = async (
  organizerId: bigint,
) => {
  const organizer = await prisma.user.findFirst({
    where: {
      id: organizerId,
      role: "ORGANIZER",
      deletedAt: null,
    },
    select: { id: true, name: true },
  });

  if (!organizer) {
    throw new ApiError("Organizer tidak ditemukan", 404);
  }

  const where = {
    transaction: {
      event: {
        organizerId,
        deletedAt: null,
      },
    },
  };

  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: { id: true, name: true },
        },
        transaction: {
          select: {
            event: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),
    prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    organizer: {
      id: organizer.id.toString(),
      name: organizer.name,
    },
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count.rating,
    reviews: reviews.map((review) => ({
      id: review.id.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        id: review.user.id.toString(),
        name: review.user.name,
      },
      event: {
        id: review.transaction.event.id.toString(),
        name: review.transaction.event.name,
      },
    })),
  };
};