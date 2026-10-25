import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

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
      where: { deletedAt: null },
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
  const event = await prisma.event.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      category: true,
      tickets: {
        where: {
          deletedAt: null,
        },
      },
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

export const createEventService = async (input: CreateEventInput) => {
  const tickets = input.tickets;

  if (!tickets.length) {
    throw new Error("Minimal satu tipe tiket wajib diisi");
  }

  for (const ticket of tickets) {
    if (!ticket.name.trim()) {
      throw new Error("Nama tiket wajib diisi");
    }

    if (
      !/^\d+$/.test(ticket.price) ||
      !Number.isSafeInteger(Number(ticket.price))
    ) {
      throw new Error("Harga tiket tidak valid");
    }

    if (!Number.isSafeInteger(ticket.quantity) || ticket.quantity < 1) {
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
type UpdateEventInput = {
  organizerId: bigint;
  eventId: bigint;
  categoryId: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  image?: string | null;
  tickets: {
    id?: string;
    name: string;
    price: string;
    quantity: number;
  }[];
};
export const updateEventService = async (input: UpdateEventInput) => {
  if (!input.tickets.length) {
    throw new ApiError("Minimal satu tipe tiket wajib diisi", 400);
  }

  if (new Date(input.endDate) <= new Date(input.startDate)) {
    throw new ApiError("Tanggal selesai harus setelah tanggal mulai", 400);
  }

  for (const ticket of input.tickets) {
    if (!ticket.name.trim()) {
      throw new ApiError("Nama tiket wajib diisi", 400);
    }

    if (
      !/^\d+$/.test(ticket.price) ||
      !Number.isSafeInteger(Number(ticket.price))
    ) {
      throw new ApiError("Harga tiket tidak valid", 400);
    }

    if (!Number.isSafeInteger(ticket.quantity) || ticket.quantity < 1) {
      throw new ApiError("Jumlah tiket minimal 1", 400);
    }
  }

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id: input.eventId,
        organizerId: input.organizerId,
        deletedAt: null,
      },
      include: {
        tickets: {
          where: { deletedAt: null },
          include: {
            transactionItems: true,
          },
        },
      },
    });

    if (!event) {
      throw new ApiError("Event tidak ditemukan", 404);
    }

    const existingTicketIds = new Set(
      event.tickets.map((ticket) => ticket.id.toString()),
    );

    const submittedIds = input.tickets
      .filter((ticket) => ticket.id)
      .map((ticket) => ticket.id!);

    if (new Set(submittedIds).size !== submittedIds.length) {
      throw new ApiError("ID tiket duplikat", 400);
    }

    for (const id of submittedIds) {
      if (!existingTicketIds.has(id)) {
        throw new ApiError("Tiket tidak valid untuk event ini", 400);
      }
    }

    const submittedIdSet = new Set(submittedIds);

    // Update tiket lama atau buat tiket baru.
    for (const ticket of input.tickets) {
      if (!ticket.id) {
        await tx.ticket.create({
          data: {
            eventId: event.id,
            name: ticket.name.trim(),
            price: BigInt(ticket.price),
            quantity: ticket.quantity,
            availableQuantity: ticket.quantity,
          },
        });

        continue;
      }

      const current = event.tickets.find(
        (item) => item.id.toString() === ticket.id,
      )!;

      // Hitung jumlah tiket yang masih dipesan/dipakai.
      const reservedQuantity = current.quantity - current.availableQuantity;

      if (ticket.quantity < reservedQuantity) {
        throw new ApiError(
          `Jumlah tiket "${current.name}" tidak boleh kurang dari jumlah yang sudah dipesan`,
          400,
        );
      }

      await tx.ticket.update({
        where: { id: current.id },
        data: {
          name: ticket.name.trim(),
          price: BigInt(ticket.price),
          quantity: ticket.quantity,
          availableQuantity: ticket.quantity - reservedQuantity,
        },
      });
    }

    // Tiket yang tidak dikirim lagi dianggap dihapus dari event.
    for (const current of event.tickets) {
      if (submittedIdSet.has(current.id.toString())) {
        continue;
      }

      const reservedQuantity = current.quantity - current.availableQuantity;

      if (reservedQuantity > 0) {
        throw new ApiError(
          `Tiket "${current.name}" masih memiliki pesanan dan tidak dapat dihapus`,
          400,
        );
      }

      if (current.transactionItems.length > 0) {
        // Pertahankan riwayat transaksi.
        await tx.ticket.update({
          where: { id: current.id },
          data: { deletedAt: new Date() },
        });
      } else {
        await tx.ticket.delete({
          where: { id: current.id },
        });
      }
    }

    const activeTickets = await tx.ticket.findMany({
      where: {
        eventId: event.id,
        deletedAt: null,
      },
      select: {
        availableQuantity: true,
      },
    });

    const availableSeats = activeTickets.reduce(
      (total, ticket) => total + ticket.availableQuantity,
      0,
    );

    await tx.event.update({
      where: { id: event.id },
      data: {
        name: input.name.trim(),
        categoryId: BigInt(input.categoryId),
        location: input.location.trim(),
        description: input.description.trim(),
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        availableSeats,
        ...(input.image !== undefined ? { image: input.image } : {}),
      },
    });

    return tx.event.findUniqueOrThrow({
      where: { id: event.id },
      include: {
        category: true,
        tickets: {
          where: { deletedAt: null },
        },
      },
    });
  });
};
export const deleteEventService = async (
  organizerId: bigint,
  eventId: bigint,
) => {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id: eventId,
        organizerId,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new ApiError("Event tidak ditemukan", 404);
    }

    const now = new Date();

    await tx.event.update({
      where: { id: event.id },
      data: {
        deletedAt: now,
      },
    });

    // Sembunyikan tiket dan voucher tanpa menghapus riwayatnya.
    await tx.ticket.updateMany({
      where: {
        eventId: event.id,
        deletedAt: null,
      },
      data: {
        deletedAt: now,
      },
    });

    await tx.voucher.updateMany({
      where: {
        eventId: event.id,
        deletedAt: null,
      },
      data: {
        deletedAt: now,
      },
    });

    return { message: "Event berhasil dihapus" };
  });
};
