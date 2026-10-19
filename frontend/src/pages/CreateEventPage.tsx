import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { FormEvent } from "react";
import {
  getEventCategories,
  createEvent,
  type EventCategory,
} from "../services/event.service";

type TicketForm = {
  id: number;
  name: string;
  price: string;
  quantity: string;
};

export default function CreateEventPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [tickets, setTickets] = useState<TicketForm[]>([
    {
      id: 1,
      name: "Regular",
      price: "",
      quantity: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryError("");

        const response = await getEventCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
        setCategoryError("Kategori gagal dimuat. Silakan coba lagi.");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const addTicket = () => {
    setTickets((currentTickets) => [
      ...currentTickets,
      {
        id: Math.max(0, ...currentTickets.map((ticket) => ticket.id)) + 1,
        name: "",
        price: "",
        quantity: "",
      },
    ]);
  };

  const removeTicket = (id: number) => {
    setTickets((currentTickets) =>
      currentTickets.filter((ticket) => ticket.id !== id),
    );
  };

  const updateTicket = (
    id: number,
    field: "name" | "price" | "quantity",
    value: string,
  ) => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === id ? { ...ticket, [field]: value } : ticket,
      ),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData(event.currentTarget);
      
      // Hapus field tiket berbentuk tickets[0][name], dst.
      for (const key of Array.from(formData.keys())) {
        if (key.startsWith("tickets[")) {
          formData.delete(key);
        }
      }

      const startDate = String(formData.get("startDate") ?? "");
      const endDate = String(formData.get("endDate") ?? "");

      if (!startDate || !endDate) {
        throw new Error("Tanggal mulai dan selesai wajib diisi.");
      }

      formData.set("startDate", new Date(startDate).toISOString());
      formData.set("endDate", new Date(endDate).toISOString());

      formData.set(
        "tickets",
        JSON.stringify(
          tickets.map((ticket) => ({
            name: ticket.name.trim(),
            price: ticket.price.trim(),
            quantity: Number(ticket.quantity),
          })),
        ),
      );

      await createEvent(formData);

      window.alert("Event berhasil dibuat!");
      navigate("/organizer/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Gagal membuat event.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/organizer/dashboard"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Kembali ke Dashboard
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Organizer Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Buat Event Baru
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Isi informasi event dan tiket yang ingin kamu tawarkan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
            >
              {submitError}
            </p>
          )}

          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Informasi Event
            </h2>

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nama Event
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Contoh: HAYA Music Festival"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="categoryId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Kategori
              </label>

              <select
                id="categoryId"
                name="categoryId"
                required
                defaultValue=""
                disabled={isLoadingCategories || categories.length === 0}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="" disabled>
                  {isLoadingCategories
                    ? "Memuat kategori..."
                    : categories.length === 0
                      ? "Kategori tidak tersedia"
                      : "Pilih kategori"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {categoryError && (
                <p className="mt-2 text-sm text-red-600">{categoryError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Lokasi
              </label>
              <input
                id="location"
                name="location"
                required
                placeholder="Nama venue atau alamat"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Tanggal dan Waktu Mulai
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Tanggal dan Waktu Selesai
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  required
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Deskripsi Event
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                placeholder="Ceritakan detail event kamu..."
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Poster Event
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
              />
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, atau WEBP. Upload akan dihubungkan ke Cloudinary
                nanti.
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Informasi Tiket
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Tambahkan satu atau beberapa jenis tiket untuk event kamu.
                </p>
              </div>

              <button
                type="button"
                onClick={addTicket}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <span aria-hidden="true">+</span>
                Tambah Tiket
              </button>
            </div>

            {tickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className="space-y-4 rounded-xl border border-gray-200 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    Tiket {index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeTicket(ticket.id)}
                    disabled={tickets.length === 1}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Hapus tiket ${index + 1}`}
                    title={
                      tickets.length === 1
                        ? "Event minimal harus memiliki satu jenis tiket"
                        : "Hapus tiket"
                    }
                  >
                    <span aria-hidden="true">×</span>
                    Hapus
                  </button>
                </div>

                <div>
                  <label
                    htmlFor={`ticket-name-${ticket.id}`}
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Nama Tiket
                  </label>
                  <input
                    id={`ticket-name-${ticket.id}`}
                    name={`tickets[${index}][name]`}
                    value={ticket.name}
                    onChange={(event) =>
                      updateTicket(ticket.id, "name", event.target.value)
                    }
                    required
                    maxLength={100}
                    placeholder="Contoh: Regular, VIP, VVIP"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`ticket-price-${ticket.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Harga Tiket (Rp)
                    </label>
                    <input
                      id={`ticket-price-${ticket.id}`}
                      name={`tickets[${index}][price]`}
                      type="number"
                      min="0"
                      step="1"
                      value={ticket.price}
                      onChange={(event) =>
                        updateTicket(ticket.id, "price", event.target.value)
                      }
                      required
                      placeholder="Contoh: 150000"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Isi 0 jika tiket gratis.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`ticket-quantity-${ticket.id}`}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Jumlah Tiket
                    </label>
                    <input
                      id={`ticket-quantity-${ticket.id}`}
                      name={`tickets[${index}][quantity]`}
                      type="number"
                      min="1"
                      step="1"
                      value={ticket.quantity}
                      onChange={(event) =>
                        updateTicket(ticket.id, "quantity", event.target.value)
                      }
                      required
                      placeholder="Contoh: 100"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Total kapasitas event</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {tickets
                  .reduce(
                    (total, ticket) =>
                      total +
                      (ticket.quantity.trim() !== "" &&
                      Number.isSafeInteger(Number(ticket.quantity)) &&
                      Number(ticket.quantity) > 0
                        ? Number(ticket.quantity)
                        : 0),
                    0,
                  )
                  .toLocaleString("id-ID")}{" "}
                <span className="text-sm font-medium text-gray-500">tiket</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Otomatis dihitung dari jumlah semua jenis tiket.
              </p>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/organizer/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
