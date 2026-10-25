import { useState } from "react";
import { Link, useParams } from "react-router";
import { useOrganizerEventAttendees } from "@/hooks/useOrganizerEventAttendees";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";

const PAGE_SIZE = 10;

const formatRupiah = (value: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  description: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </section>
  );
}

export default function OrganizerEventAttendeesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [page, setPage] = useState(1);
  const limit = PAGE_SIZE;

  const { data, isPending, isError, refetch, isFetching } =
    useOrganizerEventAttendees({
      eventId: eventId ?? "",
      page,
      limit,
    });

  if (isPending) {
    return (
      <main className="min-h-full bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-4 w-48 rounded bg-slate-200" />
          <div className="h-20 rounded-xl bg-white ring-1 ring-slate-200" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 rounded-xl bg-white ring-1 ring-slate-200"
              />
            ))}
          </div>
          <div className="h-72 rounded-xl bg-white ring-1 ring-slate-200" />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-full bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Users className="mx-auto mb-3 text-slate-400" size={32} />
          <h1 className="font-semibold text-slate-900">
            Daftar peserta tidak tersedia
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Terjadi kendala saat memuat data peserta event.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Coba Lagi
            </button>
            <Link
              to="/organizer/events"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Kembali ke event
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { totalPages, totalAttendees, totalTickets, totalRevenue } = data.meta;

  return (
    <main className="min-h-full bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Kembali ke daftar event
        </Link>

        <header className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <p className="text-sm font-medium text-slate-500">Manajemen Event</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Daftar Peserta
          </h1>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            {data.event.name}
          </h2>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} />
              Mulai {formatDate(data.event.startDate)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} />
              Data peserta berdasarkan transaksi selesai
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Peserta"
            value={totalAttendees.toLocaleString("id-ID")}
            icon={Users}
            description="Jumlah peserta unik dengan transaksi selesai"
          />
          <StatCard
            label="Total Tiket Terjual"
            value={totalTickets.toLocaleString("id-ID")}
            icon={Ticket}
            description="Jumlah seluruh tiket yang terjual"
          />
          <StatCard
            label="Total Pendapatan"
            value={formatRupiah(totalRevenue)}
            icon={Wallet}
            description="Pendapatan dari transaksi selesai"
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-900">
                Peserta Terdaftar
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Daftar pembeli dan jumlah tiket yang mereka miliki.
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {totalAttendees.toLocaleString("id-ID")} peserta
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold sm:px-6">No.</th>
                  <th className="px-5 py-3.5 font-semibold">Nama Peserta</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Jumlah Tiket</th>
                  <th className="px-5 py-3.5 text-right font-semibold sm:px-6">
                    Total Dibayar
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center">
                      <Users
                        className="mx-auto mb-3 text-slate-300"
                        size={30}
                      />
                      <p className="font-medium text-slate-700">
                        Belum ada peserta
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Peserta akan muncul setelah transaksi mereka selesai.
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.data.map((attendee, index) => (
                    <tr
                      key={attendee.userId}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 text-slate-500 sm:px-6">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {attendee.name}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {attendee.email}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                          {attendee.ticketQuantity}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-slate-800 sm:px-6">
                        {formatRupiah(attendee.totalPaid)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalAttendees > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Halaman {data.meta.page} dari {Math.max(totalPages, 1)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          HAYA · Manajemen Peserta
        </footer>
      </div>
    </main>
  );
}
