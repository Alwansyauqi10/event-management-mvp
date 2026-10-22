import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  getEventById,
  getEventCategories,
  type EventCategory,
  type Ticket,
} from "../services/event.service";
import { toast } from "sonner";

type TicketForm = {
  id?: string;
  name: string;
  price: string;
  quantity: string;
  reservedQuantity: number;
};

export default function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [tickets, setTickets] = useState<TicketForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [image, setImage] = useState<File | undefined>();
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setError("ID event tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      try {
        setError("");

        const [eventResponse, categoryResponse] = await Promise.all([
          getEventById(eventId),
          getEventCategories(),
        ]);

        const event = eventResponse.data;

        setCategories(categoryResponse.data);
        setCurrentImage(event.image);

        const toDateTimeLocal = (value: string) => {
          const date = new Date(value);
          const offset = date.getTimezoneOffset() * 60_000;
          return new Date(date.getTime() - offset).toISOString().slice(0, 16);
        };

        setForm({
          name: event.name,
          categoryId: event.categoryId,
          location: event.location,
          startDate: toDateTimeLocal(event.startDate),
          endDate: toDateTimeLocal(event.endDate),
          description: event.description,
        });

        const existingTickets: Ticket[] = event.tickets ?? [];

        setTickets(
          existingTickets.map((ticket) => ({
            id: ticket.id,
            name: ticket.name,
            price: ticket.price,
            quantity: String(ticket.quantity),
            reservedQuantity: ticket.quantity - ticket.availableQuantity,
          })),
        );
      } catch (err) {
        console.error("Gagal memuat event:", err);
        setError("Gagal memuat detail event. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvent();
  }, [eventId]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addTicket = () => {
    setTickets((current) => [
      ...current,
      {
        name: "",
        price: "",
        quantity: "",
        reservedQuantity: 0,
      },
    ]);
  };

  const updateTicket = (
    index: number,
    field: "name" | "price" | "quantity",
    value: string,
  ) => {
    setTickets((current) =>
      current.map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket,
      ),
    );
  };

  const removeTicket = (index: number) => {
    setTickets((current) => current.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <p className="p-6">Memuat detail event...</p>;
  }

  if (error && !form.name) {
    return (
      <main className="space-y-4 p-6">
        <p role="alert" className="text-red-600">
          {error}
        </p>
        <Link to="/organizer/events" className="text-blue-600">
          Kembali ke Event Saya
        </Link>
      </main>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!eventId) {
      setError("ID event tidak ditemukan.");
      return;
    }

    if (tickets.length === 0) {
      setError("Minimal satu tipe tiket wajib diisi.");
      return;
    }

    const invalidTicket = tickets.find(
      (ticket) =>
        !ticket.name.trim() ||
        !/^\d+$/.test(ticket.price) ||
        !Number.isSafeInteger(Number(ticket.price)) ||
        !Number.isSafeInteger(Number(ticket.quantity)) ||
        Number(ticket.quantity) < 1 ||
        Number(ticket.quantity) < ticket.reservedQuantity,
    );

    if (invalidTicket) {
      setError(
        "Periksa nama, harga, dan jumlah tiket. Jumlah tiket tidak boleh kurang dari jumlah yang sudah dipesan.",
      );
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (
      !form.name.trim() ||
      !form.categoryId ||
      !form.location.trim() ||
      !form.description.trim() ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      setError("Periksa kembali informasi event dan tanggalnya.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { updateOrganizerEvent } =
        await import("../services/event.service");

      await updateOrganizerEvent(eventId, {
        ...form,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tickets: tickets.map((ticket) => ({
          ...(ticket.id ? { id: ticket.id } : {}),
          name: ticket.name.trim(),
          price: ticket.price.trim(),
          quantity: Number(ticket.quantity),
        })),
        ...(image ? { image } : {}),
      });

      toast.success("Event berhasil diperbarui!");
      navigate("/organizer/events");
    } catch (err) {
      console.error("Gagal memperbarui event:", err);
      toast.error("Gagal memperbarui event. Periksa data dan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/organizer/events"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Kembali ke Event Saya
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Organizer Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="mt-2 text-sm text-gray-500">
            Perbarui informasi event dan jenis tiket.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <section className="space-y-5 rounded-2xl border bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Informasi Event</h2>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Nama Event
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="categoryId"
                className="mb-2 block text-sm font-medium"
              >
                Kategori
              </label>
              <select
                id="categoryId"
                required
                value={form.categoryId}
                onChange={(e) => updateField("categoryId", e.target.value)}
                className="w-full rounded-xl border bg-white px-4 py-3"
              >
                <option value="" disabled>
                  Pilih kategori
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium"
              >
                Lokasi
              </label>
              <input
                id="location"
                required
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium"
                >
                  Tanggal dan Waktu Mulai
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  required
                  value={form.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="w-full rounded-xl border px-3 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="mb-2 block text-sm font-medium"
                >
                  Tanggal dan Waktu Selesai
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  required
                  value={form.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                  className="w-full rounded-xl border px-3 py-3"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                required
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-medium">
                Poster Event
              </label>

              {currentImage && (
                <img
                  src={currentImage}
                  alt="Poster event saat ini"
                  className="mb-3 max-h-56 rounded-xl border object-contain"
                />
              )}

              <input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setImage(e.target.files?.[0])}
                className="w-full rounded-xl border px-4 py-3"
              />
              <p className="mt-2 text-xs text-gray-500">
                Kosongkan jika ingin mempertahankan poster saat ini.
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Informasi Tiket</h2>
              <button
                type="button"
                onClick={addTicket}
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                + Tambah Tiket
              </button>
            </div>

            {tickets.map((ticket, index) => (
              <div
                key={ticket.id ?? `new-${index}`}
                className="space-y-4 rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Tiket {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeTicket(index)}
                    disabled={tickets.length === 1}
                    className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    Hapus
                  </button>
                </div>

                {ticket.id && (
                  <p className="text-xs text-gray-500">
                    Tiket lama · {ticket.reservedQuantity} sudah dipesan
                  </p>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nama Tiket
                  </label>
                  <input
                    required
                    value={ticket.name}
                    onChange={(e) =>
                      updateTicket(index, "name", e.target.value)
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Harga Tiket (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={ticket.price}
                      onChange={(e) =>
                        updateTicket(index, "price", e.target.value)
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Jumlah Tiket
                    </label>
                    <input
                      type="number"
                      min={Math.max(1, ticket.reservedQuantity)}
                      step="1"
                      required
                      value={ticket.quantity}
                      onChange={(e) =>
                        updateTicket(index, "quantity", e.target.value)
                      }
                      className="w-full rounded-xl border px-4 py-3"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Total kapasitas yang diatur
              </p>
              <p className="mt-1 text-2xl font-bold">
                {tickets
                  .reduce(
                    (total, ticket) =>
                      total +
                      (Number.isSafeInteger(Number(ticket.quantity)) &&
                      Number(ticket.quantity) > 0
                        ? Number(ticket.quantity)
                        : 0),
                    0,
                  )
                  .toLocaleString("id-ID")}{" "}
                <span className="text-sm font-medium text-gray-500">tiket</span>
              </p>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/organizer/events"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
