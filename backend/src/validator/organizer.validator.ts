import z from "zod";

export const organizerTransactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z
    .enum([
      "WAITING_FOR_PAYMENT",
      "WAITING_FOR_ADMIN_CONFIRMATION",
      "DONE",
      "REJECTED",
      "EXPIRED",
      "CANCELED",
    ])
    .optional(),
});
export type OrganizerTransactionQuery = z.infer<
  typeof organizerTransactionQuerySchema
>;
