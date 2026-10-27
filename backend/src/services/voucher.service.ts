
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const voucherFields = {
  code: z
    .string()
    .trim()
    .min(3, "Kode voucher minimal 3 karakter")
    .max(30, "Kode voucher maksimal 30 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh berisi huruf, angka, _ dan -"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Diskon harus lebih dari 0"),
  maxDiscount: z.number().positive().optional(),
  quota: z.number().int().positive("Kuota harus lebih dari 0"),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
};

const createVoucherSchema = z
  .object({
    eventId: z.string().min(1, "Event wajib dipilih"),
    ...voucherFields,
  })
  .superRefine(validateVoucherFields);

const updateVoucherSchema = z
  .object(voucherFields)
  .superRefine(validateVoucherFields);

function validateVoucherFields(
  data: {
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxDiscount?: number;
    startAt: Date;
    endAt: Date;
  },
  ctx: z.RefinementCtx,
) {
  if (data.endAt <= data.startAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "Waktu berakhir harus setelah waktu mulai",
    });
  }

  if (
    data.discountType === "PERCENTAGE" &&
    data.discountValue > 100
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["discountValue"],
      message: "Diskon persentase maksimal 100%",
    });
  }

  if (
    data.discountType === "FIXED" &&
    data.maxDiscount !== undefined
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxDiscount"],
      message: "maxDiscount hanya digunakan untuk diskon persentase",
    });
  }
}

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;

export class VoucherServiceError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
  ) {
    super(message);
    this.name = "VoucherServiceError";
  }
}

const parseId = (value: string, fieldName: string): bigint => {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new VoucherServiceError(`${fieldName} tidak valid`);
  }

  return BigInt(value);
};

export const createVoucherService = async (
  organizerId: string,
  input: CreateVoucherInput,
) => {
  const data = createVoucherSchema.parse(input);
  const eventId = parseId(data.eventId, "Event ID");
  const organizerIdBigInt = parseId(organizerId, "Organizer ID");

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId: organizerIdBigInt,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!event) {
    throw new VoucherServiceError(
      "Event tidak ditemukan atau bukan milik organizer ini",
      404,
    );
  }

  const code = data.code.toUpperCase();
  const existingVoucher = await prisma.voucher.findUnique({
    where: { code },
    select: { id: true },
  });

  if (existingVoucher) {
    throw new VoucherServiceError("Kode voucher sudah digunakan", 409);
  }

  try {
    return await prisma.voucher.create({
      data: {
        eventId,
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscount: data.maxDiscount,
        quota: data.quota,
        startAt: data.startAt,
        endAt: data.endAt,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new VoucherServiceError("Kode voucher sudah digunakan", 409);
    }

    throw error;
  }
};

export const getEventVouchersService = async (
  organizerId: string,
  eventId: string,
) => {
  const eventIdBigInt = parseId(eventId, "Event ID");
  const organizerIdBigInt = parseId(organizerId, "Organizer ID");

  const event = await prisma.event.findFirst({
    where: {
      id: eventIdBigInt,
      organizerId: organizerIdBigInt,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!event) {
    throw new VoucherServiceError(
      "Event tidak ditemukan atau bukan milik organizer ini",
      404,
    );
  }

  return prisma.voucher.findMany({
    where: {
      eventId: eventIdBigInt,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Memperbarui voucher milik organizer.
 * Jika sudah digunakan, hanya kuota yang boleh diubah,
 * dan kuota baru tidak boleh kurang dari usedQuantity.
 */
export const updateVoucherService = async (
  organizerId: string,
  voucherId: string,
  input: UpdateVoucherInput,
) => {
  const data = updateVoucherSchema.parse(input);
  const id = parseId(voucherId, "Voucher ID");
  const organizerIdBigInt = parseId(organizerId, "Organizer ID");

  const voucher = await prisma.voucher.findFirst({
    where: {
      id,
      deletedAt: null,
      event: {
        organizerId: organizerIdBigInt,
        deletedAt: null,
      },
    },
  });

  if (!voucher) {
    throw new VoucherServiceError(
      "Voucher tidak ditemukan atau bukan milik organizer ini",
      404,
    );
  }

  if (data.quota < voucher.usedQuantity) {
    throw new VoucherServiceError(
      `Kuota tidak boleh kurang dari jumlah yang sudah digunakan (${voucher.usedQuantity})`,
    );
  }

  if (voucher.usedQuantity > 0) {
    const onlyQuotaChanged =
      data.code.trim().toUpperCase() === voucher.code &&
      data.discountType === voucher.discountType &&
      data.discountValue === Number(voucher.discountValue) &&
      (data.maxDiscount ?? null) ===
        (voucher.maxDiscount == null ? null : Number(voucher.maxDiscount)) &&
      data.startAt.getTime() === voucher.startAt.getTime() &&
      data.endAt.getTime() === voucher.endAt.getTime();

    if (!onlyQuotaChanged) {
      throw new VoucherServiceError(
        "Voucher sudah digunakan. Kode, diskon, dan periode tidak dapat diubah; hanya kuota yang dapat dinaikkan.",
      );
    }

    if (data.quota < voucher.quota) {
      throw new VoucherServiceError(
        "Kuota voucher yang sudah digunakan tidak boleh dikurangi",
      );
    }
  }

  const code = data.code.trim().toUpperCase();

  const existingVoucher = await prisma.voucher.findUnique({
    where: { code },
    select: { id: true },
  });

  if (
    existingVoucher &&
    existingVoucher.id !== voucher.id
  ) {
    throw new VoucherServiceError("Kode voucher sudah digunakan", 409);
  }

  try {
    return await prisma.voucher.update({
      where: { id },
      data: {
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscount: data.maxDiscount,
        quota: data.quota,
        startAt: data.startAt,
        endAt: data.endAt,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new VoucherServiceError("Kode voucher sudah digunakan", 409);
    }

    throw error;
  }
};

export const deactivateVoucherService = async (
  organizerId: string,
  voucherId: string,
) => {
  const id = parseId(voucherId, "Voucher ID");
  const organizerIdBigInt = parseId(organizerId, "Organizer ID");

  const voucher = await prisma.voucher.findFirst({
    where: {
      id,
      deletedAt: null,
      event: {
        organizerId: organizerIdBigInt,
        deletedAt: null,
      },
    },
    select: { id: true },
  });

  if (!voucher) {
    throw new VoucherServiceError(
      "Voucher tidak ditemukan atau bukan milik event organizer ini",
      404,
    );
  }

  return prisma.voucher.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
