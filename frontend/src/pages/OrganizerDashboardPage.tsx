import { useOrganizerDashboard } from "@/hooks/useOrganizerDashboard";
import { Link } from "react-router";

const eventStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELED: "Canceled",
  COMPLETED: "Completed",
};

const transactionStatusLabels: Record<string, string> = {
  WAITING_FOR_PAYMENT: "Menunggu Pembayaran",
  WAITING_FOR_ADMIN_CONFIRMATION: "Menunggu Konfirmasi",
  DONE: "Selesai",
  REJECTED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
  CANCELED: "Dibatalkan",
};

const eventStatusStyles: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 ring-gray-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELED: "bg-red-50 text-red-700 ring-red-200",
  COMPLETED: "bg-blue-50 text-blue-700 ring-blue-200",
};

const transactionStatusStyles: Record<string, string> = {
  WAITING_FOR_PAYMENT: "bg-amber-50 text-amber-700 ring-amber-200",
  WAITING_FOR_ADMIN_CONFIRMATION:
    "bg-violet-50 text-violet-700 ring-violet-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  EXPIRED: "bg-gray-100 text-gray-600 ring-gray-200",
  CANCELED: "bg-rose-50 text-rose-700 ring-rose-200",
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function StatCard({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value.toLocaleString("id-ID")}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${iconClass}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function StatusBadge({
  status,
  labels,
  styles,
}: {
  status: string;
  labels: Record<string, string>;
  styles: Record<string, string>;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      <span
        className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {labels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}

export default function OrganizerDashboardPage() {
  const { data, isPending, isError, error, refetch } = useOrganizerDashboard();

  if (isPending) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-9 w-64 max-w-full rounded-lg bg-gray-200" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>

          <div className="h-64 rounded-2xl border border-gray-200 bg-white" />
          <p className="text-center text-sm text-gray-500">
            Menyiapkan dashboard kamu...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !data?.data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Dashboard gagal dimuat
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Terjadi kendala saat mengambil data dashboard. Silakan coba lagi.
          </p>

          {isError && error instanceof Error && (
            <p className="mt-3 wrap-break-words text-xs text-red-500">
              {error.message}
            </p>
          )}

          <button
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <span aria-hidden="true">↻</span>
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  const { summary, recentEvents } = data.data;

  return (
    <main className="min-h-screen bg-gray-50/80 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              ORGANIZER PANEL
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Dashboard Organizer
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Pantau performa event dan kelola transaksi kamu dalam satu tempat.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/organizer/events/create"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              <span aria-hidden="true">+</span>
              Buat Event
            </Link>

            <Link
              to="/organizer/transactions"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <span aria-hidden="true">▤</span>
              Lihat Transaksi
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        {/* Main Statistics */}
        <section aria-labelledby="overview-heading" className="space-y-4">
          <div>
            <h2
              id="overview-heading"
              className="text-lg font-bold text-gray-900"
            >
              Ringkasan Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gambaran umum aktivitas event kamu.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Event"
              value={summary.totalEvents}
              description="Total event yang terdaftar"
              icon="▦"
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              label="Dipublikasikan"
              value={summary.eventsByStatus.PUBLISHED ?? 0}
              description="Event yang sudah tersedia"
              icon="✓"
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              label="Menunggu Pembayaran"
              value={summary.transactionsByStatus.WAITING_FOR_PAYMENT ?? 0}
              description="Transaksi yang perlu dipantau"
              icon="◷"
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              label="Transaksi Selesai"
              value={summary.transactionsByStatus.DONE ?? 0}
              description="Transaksi berstatus selesai"
              icon="↗"
              iconClass="bg-violet-50 text-violet-600"
            />
          </div>
        </section>

        {/* Event Status */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Status Event</h2>
            <p className="mt-1 text-sm text-gray-500">
              Distribusi event berdasarkan status saat ini.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {Object.entries(eventStatusLabels).map(([status, label]) => (
              <div
                key={status}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3">
                  <StatusBadge
                    status={status}
                    labels={eventStatusLabels}
                    styles={eventStatusStyles}
                  />

                  <p className="text-2xl font-bold tracking-tight text-gray-900">
                    {summary.eventsByStatus[
                      status as keyof typeof summary.eventsByStatus
                    ] ?? 0}
                  </p>

                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction Status */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Status Transaksi
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Pantau alur transaksi dan status pembayaran.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(transactionStatusLabels).map(([status, label]) => (
              <div
                key={status}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 sm:p-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {summary.transactionsByStatus[
                      status as keyof typeof summary.transactionsByStatus
                    ] ?? 0}
                  </p>
                </div>

                <StatusBadge
                  status={status}
                  labels={transactionStatusLabels}
                  styles={transactionStatusStyles}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Recent Events */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Event Terbaru</h2>
              <p className="mt-1 text-sm text-gray-500">
                Daftar event terbaru yang kamu kelola.
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {recentEvents.length} event
            </span>
          </div>

          {recentEvents.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
                ▦
              </div>

              <h3 className="mt-5 font-semibold text-gray-900">
                Belum ada event
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Event yang kamu buat akan muncul di sini. Mulai buat event
                pertamamu untuk melihat ringkasan aktivitas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-500">
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Nama Event
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Lokasi
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Tanggal Mulai
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right font-semibold"
                    >
                      Transaksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {recentEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="transition-colors hover:bg-blue-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-60">
                          <p className="truncate font-semibold text-gray-900">
                            {event.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            ID: {event.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {event.category.name}
                      </td>

                      <td className="max-w-50 px-6 py-4">
                        <span className="block truncate text-gray-600">
                          {event.location}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {formatDate(event.startDate)}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={event.status}
                          labels={eventStatusLabels}
                          styles={eventStatusStyles}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-gray-100 px-2.5 py-1.5 font-semibold text-gray-700">
                          {event.totalTransactions.toLocaleString("id-ID")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recentEvents.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 sm:px-6">
              <p className="text-xs text-gray-500">
                Menampilkan {recentEvents.length} event terbaru.
              </p>
            </div>
          )}
        </section>

        <footer className="pb-2 text-center text-xs text-gray-400">
          Organizer Dashboard · Kelola event dengan lebih mudah
        </footer>
      </div>
    </main>
  );
}
