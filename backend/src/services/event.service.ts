import { prisma } from "../lib/prisma.js";

type GetEventsParams = {
  search?: string;
  category?: string;
  location?: string;
  page: number;
  limit: number;
};

export const getEventsService = async ({
  search,
  category,
  location,
  page,
  limit,
}: GetEventsParams) => {
  const where = {
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),

    ...(category && {
      category: {
        name: {
          equals: category,
          mode: "insensitive" as const,
        },
      },
    }),

    ...(location && {
      location: {
        contains: location,
        mode: "insensitive" as const,
      },
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        category: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.event.count({
      where,
    }),
  ]);

  return {
    events,
    total,
  };
};

export const getEventLocationsService = async () => {
  const locations = await prisma.event.findMany({
    select: {
      location: true,
    },
    distinct: ["location"],
    orderBy: {
      location: "asc",
    },
  });

  return locations.map((event) => event.location);
};

export const getEventByIdService = async (id: bigint) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  return event;
};