import { prisma } from "../lib/prisma.js";

export const getEventsService = async () => {
  const events = await prisma.event.findMany({
  include: {
    category: true,
  },
});

  return events;
};