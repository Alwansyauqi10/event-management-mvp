import { prisma } from "../lib/prisma.js";

export const organizerDashboardService = async (userId: string) => {
  const organizerId = BigInt(userId);

  const eventWhere = {
    organizerId,
    deletedAt: null,
  };

  const transactionWhere = {
    event: {
      organizerId,
      deletedAt: null,
    },
  };

  const [totalEvents, eventStatuses, transactionStatuses, recentEvents] =
    await Promise.all([
      // Total event milik organizer
      prisma.event.count({
        where: eventWhere,
      }),

      // Jumlah event per status
      prisma.event.groupBy({
        by: ["status"],
        where: eventWhere,
        _count: {
          _all: true,
        },
      }),

      // Jumlah transaksi untuk semua event milik organizer
      prisma.eventTransaction.groupBy({
        by: ["status"],
        where: transactionWhere,
        _count: {
          _all: true,
        },
      }),

      // Lima event terbaru milik organizer
      prisma.event.findMany({
        where: eventWhere,
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          location: true,
          startDate: true,
          status: true,
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              eventTransactions: true,
            },
          },
        },
      }),
    ]);

  const eventsByStatus = Object.fromEntries(
    eventStatuses.map((item) => [item.status, item._count._all]),
  );

  const transactionsByStatus = Object.fromEntries(
    transactionStatuses.map((item) => [item.status, item._count._all]),
  );

  return {
    summary: {
      totalEvents,
      eventsByStatus,
      transactionsByStatus,
    },
    recentEvents: recentEvents.map((event) => ({
      ...event,
      id: event.id.toString(),
      totalTransactions: event._count.eventTransactions,
      _count: undefined,
    })),
  };
};
