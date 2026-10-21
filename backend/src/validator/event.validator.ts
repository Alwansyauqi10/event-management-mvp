import { z } from "zod";

export const createEventSchema = z
  .object({
    name: z.string().trim().min(1, "Nama event wajib diisi"),
    categoryId: z.string().regex(/^\d+$/, "Kategori tidak valid"),
    location: z.string().trim().min(1, "Lokasi wajib diisi"),
    startDate: z.string().datetime({
      message: "Tanggal mulai tidak valid",
    }),
    endDate: z.string().datetime({
      message: "Tanggal selesai tidak valid",
    }),
    description: z.string().trim().min(1, "Deskripsi wajib diisi"),
    tickets: z.string().min(1, "Minimal satu tipe tiket wajib diisi"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"],
  });
export const updateEventSchema = createEventSchema;
