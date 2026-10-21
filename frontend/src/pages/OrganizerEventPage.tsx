import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getOrganizerEvents } from "../services/event.service";

export default function OrganizerEventsPage() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["organizer-events", page, limit],
    queryFn: () => getOrganizerEvents({ page, limit }),
  });

  if (isPending) {
    return <p className="p-6">Memuat event...</p>;
  }

  if (isError) {
    return (
      <p className="p-6 text-red-600">Gagal memuat event: {error.message}</p>
    );
  }

  const { data: events, meta } = data;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Event Saya</h1>
        <p className="mt-1 text-gray-500">Kelola event yang kamu buat.</p>
      </div>

      <p className="text-sm text-gray-600">Total event: {meta.total}</p>

      {events.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          <p>Belum ada event yang kamu buat.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Nama Event</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Status</th>
                <th className="p-4">Transaksi</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t">
                  <td className="p-4 font-medium">{event.name}</td>

                  <td className="p-4">{event.category.name}</td>

                  <td className="p-4">{event.location}</td>

                  <td className="p-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {event.status}
                    </span>
                  </td>

                  <td className="p-4">{event._count.eventTransactions}</td>

                  <td className="p-4">
                    <Link
                      to={`/organizer/events/${event.id}/attendees`}
                      className="inline-block whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    >
                      Lihat Peserta
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((current) => current - 1)}
          className="rounded-lg border px-4 py-2 disabled:opacity-40"
        >
          Sebelumnya
        </button>

        <span className="text-sm">
          Halaman {meta.page} dari {meta.totalPages}
        </span>

        <button
          type="button"
          disabled={page >= meta.totalPages}
          onClick={() => setPage((current) => current + 1)}
          className="rounded-lg border px-4 py-2 disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </main>
  );
}
