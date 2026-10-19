import { prisma } from "../lib/prisma.js";


type GetEventsParams = {
  search?: string;
  category?: string;
  location?: string;
  page: number;
  limit: number;
};

type CreateEventInput = {
  organizerId: bigint;
  categoryId: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  image: string | null;
  tickets: {
    name: string;
    price: string;
    quantity: number;
  }[];
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

export const getEventTicketsService = async (eventId: bigint) => {
  const tickets = await prisma.ticket.findMany({
    where: {
      eventId,
      deletedAt: null,
    },
    orderBy: {
      price: "asc",
    },
  });

  return tickets;
};

export const getEventCategoriesService = async () => {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const createEventService = async (
  input: CreateEventInput,
) => {
  const tickets = input.tickets;

  if (!tickets.length) {
    throw new Error("Minimal satu tipe tiket wajib diisi");
  }

  for (const ticket of tickets) {
    if (!ticket.name.trim()) {
      throw new Error("Nama tiket wajib diisi");
    }

    if (!/^\d+$/.test(ticket.price) || !Number.isSafeInteger(Number(ticket.price))) {
      throw new Error("Harga tiket tidak valid");
    }

    if (
      !Number.isSafeInteger(ticket.quantity) ||
      ticket.quantity < 1
    ) {
      throw new Error("Jumlah tiket minimal 1");
    }
  }

  if (new Date(input.endDate) <= new Date(input.startDate)) {
    throw new Error("Tanggal selesai harus setelah tanggal mulai");
  }

  const availableSeats = tickets.reduce(
    (total, ticket) => total + ticket.quantity,
    0,
  );

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        organizerId: input.organizerId,
        categoryId: BigInt(input.categoryId),
        name: input.name,
        description: input.description,
        location: input.location,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        availableSeats,
        image: input.image,
        status: "PUBLISHED",
      },
    });

    await tx.ticket.createMany({
      data: tickets.map((ticket) => ({
        eventId: event.id,
        name: ticket.name.trim(),
        price: BigInt(ticket.price),
        quantity: ticket.quantity,
        availableQuantity: ticket.quantity,
      })),
    });

    return tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        category: true,
        tickets: true,
      },
    });
  });
};
