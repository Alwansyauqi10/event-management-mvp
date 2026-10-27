import { useState } from "react";
import { Link } from "react-router";
import {
  useOrganizerEvents,
  useDeleteOrganizerEvent,
} from "@/hooks/useOrganizerEvents";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  Tag,
  TicketPercent,
  Trash2,
  Users,
  X,
} from "lucide-react";

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Dipublikasikan",
    CANCELED: "Dibatalkan",
    COMPLETED: "Selesai",
  };

  return labels[status] ?? status;
};

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700 ring-amber-600/20",
    PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    CANCELED: "bg-rose-50 text-rose-700 ring-rose-600/20",
    COMPLETED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return styles[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function OrganizerEventsPage() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data, isPending, isError, error } = useOrganizerEvents({
    page,
    limit,
  });

  const deleteMutation = useDeleteOrganizerEvent();
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteEventId) return;

    try {
      await deleteMutation.mutateAsync(deleteEventId);
      setDeleteEventId(null);
    } catch {
      // Pesan error ditampilkan di modal.
    }
  };

  if (isPending) {
    return (
      <main className="min-h-full bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-20 rounded-xl bg-white ring-1 ring-slate-200" />
          <div className="h-80 rounded-xl bg-white ring-1 ring-slate-200" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-full bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-8 text-center">
          <CalendarDays className="mx-auto mb-3 text-slate-400" size={32} />
          <h1 className="font-semibold text-slate-900">
            Event tidak dapat dimuat
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error instanceof Error
              ? error.message
              : "Terjadi kendala saat mengambil daftar event."}
          </p>
          <Link
            to="/organizer/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Kembali ke dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { data: events, meta } = data;
  const selectedEvent = events.find((event) => event.id === deleteEventId);

  return (
    <main className="min-h-full bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Ruang Kerja Organizer
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Event Saya
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola event, peserta, check-in, dan ulasan event kamu.
            </p>
          </div>

          <Link
            to="/organizer/events/create"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 sm:self-auto"
          >
            <Plus size={17} />
            Buat Event
          </Link>
        </header>

        <section className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5">
          <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
            <CalendarDays size={22} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Event</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {meta.total.toLocaleString("id-ID")}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-900">Daftar Event</h2>
              <p className="mt-1 text-sm text-slate-500">
                Informasi dan tindakan untuk setiap event yang kamu buat.
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {events.length} event di halaman ini
            </span>
          </div>

          {events.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays className="mx-auto mb-3 text-slate-300" size={36} />
              <h3 className="font-semibold text-slate-800">Belum ada event</h3>
              <p className="mt-1 text-sm text-slate-500">
                Event yang kamu buat akan muncul di sini.
              </p>
              <Link
                to="/organizer/events/create"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                <Plus size={16} />
                Buat Event Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-262 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">
                      Nama Event
                    </th>
                    <th className="px-5 py-3.5 font-semibold">Kategori</th>
                    <th className="px-5 py-3.5 font-semibold">Lokasi</th>
                    <th className="px-5 py-3.5 font-semibold">Mulai</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold">Transaksi</th>
                    <th className="px-5 py-3.5 text-right font-semibold sm:px-6">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <p className="max-w-56 font-semibold text-slate-800">
                          {event.name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Tag size={14} className="text-slate-400" />
                          {event.category.name}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <span className="flex max-w-48 items-start gap-1.5">
                          <MapPin
                            size={14}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                          <span>{event.location}</span>
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(event.startDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(event.status)}`}
                        >
                          {getStatusLabel(event.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {event._count.eventTransactions.toLocaleString("id-ID")}
                      </td>

                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/organizer/events/${event.id}/attendees`}
                            title="Lihat Peserta"
                            aria-label={`Lihat peserta ${event.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Users size={17} />
                          </Link>

                          <Link
                            to={`/organizer/events/${event.id}/vouchers`}
                            title="Kelola Voucher"
                            aria-label={`Kelola voucher ${event.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
                          >
                            <TicketPercent size={17} />
                          </Link>

                          <Link
                            to={`/organizer/events/${event.id}/check-in`}
                            title="Check-in"
                            aria-label={`Check-in ${event.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <ClipboardCheck size={17} />
                          </Link>

                          <Link
                            to={`/organizer/events/${event.id}/review`}
                            title="Review & Rating"
                            aria-label={`Review dan rating ${event.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <MessageSquareText size={17} />
                          </Link>

                          <Link
                            to={`/organizer/events/${event.id}/edit`}
                            title="Edit Event"
                            aria-label={`Edit ${event.name}`}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Pencil size={17} />
                          </Link>

                          <button
                            type="button"
                            title="Hapus Event"
                            aria-label={`Hapus ${event.name}`}
                            onClick={() => {
                              deleteMutation.reset();
                              setDeleteEventId(event.id);
                            }}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">
              Total {meta.total.toLocaleString("id-ID")} event
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>

              <span className="whitespace-nowrap text-sm text-slate-500">
                {meta.page} / {Math.max(meta.totalPages, 1)}
              </span>

              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          HAYA · Manajemen Event
        </footer>
      </div>

      {deleteEventId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onClick={() => {
            if (!deleteMutation.isPending) {
              setDeleteEventId(null);
              deleteMutation.reset();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 size={21} />
            </div>

            <h2
              id="delete-event-title"
              className="text-lg font-semibold text-slate-900"
            >
              Hapus Event?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kamu akan menghapus event{" "}
              <span className="font-semibold text-slate-700">
                {selectedEvent?.name ?? "ini"}
              </span>{" "}
              dari daftar event aktif. Pastikan kamu ingin melanjutkan tindakan
              ini.
            </p>

            {deleteMutation.isError && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                Gagal menghapus event. Silakan coba lagi.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  setDeleteEventId(null);
                  deleteMutation.reset();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                Batal
              </button>

              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
