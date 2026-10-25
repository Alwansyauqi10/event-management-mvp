import { useOrganizerEventAttendees } from "@/hooks/useOrganizerEventAttendees";
import { useState } from "react";
import { Link, useParams } from "react-router";

const PAGE_SIZE = 10;

const formatRupiah = (value: string | number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export default function OrganizerEventAttendeesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isPending, isError } = useOrganizerEventAttendees({
    eventId: eventId!,
    page,
    limit,
  });
  if (isPending) {
    return <p className="p-6">Memuat daftar peserta...</p>;
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <p>Gagal memuat daftar peserta.</p>
        <Link
          to="/organizer/events"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Kembali ke daftar event
        </Link>
      </div>
    );
  }

  const { totalPages, totalAttendees } = data.meta;

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link
          to="/organizer/events"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Kembali ke daftar event
        </Link>

        <h1 className="mt-3 text-2xl font-bold">Daftar Peserta</h1>
        <p className="mt-1 text-gray-600">{data.event.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Peserta</p>
          <p className="mt-2 text-2xl font-bold">{data.meta.totalAttendees}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Tiket Terjual</p>
          <p className="mt-2 text-2xl font-bold">{data.meta.totalTickets}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Pendapatan</p>
          <p className="mt-2 text-xl font-bold">
            {formatRupiah(data.meta.totalRevenue)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Nama Peserta</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Jumlah Tiket</th>
              <th className="px-4 py-3">Total Dibayar</th>
            </tr>
          </thead>

          <tbody>
            {data.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Belum ada peserta dengan transaksi selesai.
                </td>
              </tr>
            ) : (
              data.data.map((attendee, index) => (
                <tr key={attendee.userId} className="border-t">
                  <td className="px-4 py-3">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{attendee.name}</td>
                  <td className="px-4 py-3">{attendee.email}</td>
                  <td className="px-4 py-3">{attendee.ticketQuantity}</td>
                  <td className="px-4 py-3">
                    {formatRupiah(attendee.totalPaid)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalAttendees > 0 && (
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
            Halaman {data.meta.page} dari {data.meta.totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
