import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

export const getOrganizerPublicProfileService = async (id: bigint) => {
  const organizer = await prisma.user.findFirst({
    where: {
      id,
      role: "ORGANIZER",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      profilePicture: true,
      createdAt: true,
    },
  });

  if (!organizer) {
    throw new ApiError("Organizer tidak ditemukan", 404);
  }

  const now = new Date();

  const [totalPublishedEvents, completedEvents, upcomingEvents, reviews] =
    await Promise.all([
      prisma.event.count({
        where: {
          organizerId: id,
          deletedAt: null,
          status: "PUBLISHED",
        },
      }),

      prisma.event.count({
        where: {
          organizerId: id,
          deletedAt: null,
          status: "COMPLETED",
        },
      }),

      prisma.event.count({
        where: {
          organizerId: id,
          deletedAt: null,
          status: "PUBLISHED",
          startDate: { gt: now },
        },
      }),

      prisma.review.aggregate({
        where: {
          transaction: {
            event: {
              organizerId: id,
              deletedAt: null,
            },
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

  return {
    ...organizer,
    id: organizer.id.toString(),
    createdAt: organizer.createdAt,
    stats: {
      totalPublishedEvents,
      completedEvents,
      upcomingEvents,
      averageRating:
        reviews._avg.rating === null
          ? null
          : Number(reviews._avg.rating.toFixed(1)),
      totalReviews: reviews._count.rating,
    },
  };
};

export const getOrganizerPublicEventsService = async (id: bigint) => {
  const organizer = await prisma.user.findFirst({
    where: {
      id,
      role: "ORGANIZER",
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!organizer) {
    throw new ApiError("Organizer tidak ditemukan", 404);
  }

  const events = await prisma.event.findMany({
    where: {
      organizerId: id,
      deletedAt: null,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      image: true,
      startDate: true,
      endDate: true,
      availableSeats: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return events.map((event) => ({
    ...event,
    id: event.id.toString(),
    category: {
      ...event.category,
      id: event.category.id.toString(),
    },
  }));
};