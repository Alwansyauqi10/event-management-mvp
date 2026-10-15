import { useOrganizerDashboard } from "@/hooks/useOrganizerDashboard";

const eventStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELED: "Canceled",
  COMPLETED: "Completed",
};

const transactionStatusLabels: Record<string, string> = {
  WAITING_FOR_PAYMENT: "Waiting for Payment",
  WAITING_FOR_ADMIN_CONFIRMATION: "Waiting for Admin Confirmation",
  DONE: "Done",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELED: "Canceled",
};

export default function OrganizerDashboardPage() {
  const { data, isPending, isError, error, refetch } = useOrganizerDashboard();

  if (isPending) {
    return <p className="p-6">Memuat dashboard...</p>;
  }

  if (isError) {
    return (
      <div className="space-y-3 p-6">
        <p>Gagal memuat dashboard.</p>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : "Terjadi kesalahan."}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const { summary, recentEvents } = data.data;

  return (
    <main className="space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Ringkasan event dan transaksi kamu.
        </p>
      </header>

      <section>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Event</p>
          <p className="mt-2 text-3xl font-bold">{summary.totalEvents}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Event berdasarkan Status</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(eventStatusLabels).map(([status, label]) => (
            <div key={status} className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">
                {summary.eventsByStatus[
                  status as keyof typeof summary.eventsByStatus
                ] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Transaksi berdasarkan Status</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(transactionStatusLabels).map(([status, label]) => (
            <div key={status} className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">
                {summary.transactionsByStatus[
                  status as keyof typeof summary.transactionsByStatus
                ] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Event Terbaru</h2>

        {recentEvents.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="font-medium">Belum ada event</p>
            <p className="mt-1 text-sm text-gray-500">
              Event yang kamu buat akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama Event</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Lokasi</th>
                  <th className="px-4 py-3 font-medium">Tanggal Mulai</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Transaksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 font-medium">{event.name}</td>
                    <td className="px-4 py-3">{event.category.name}</td>
                    <td className="px-4 py-3">{event.location}</td>
                    <td className="px-4 py-3">
                      {new Date(event.startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {eventStatusLabels[event.status] ?? event.status}
                    </td>
                    <td className="px-4 py-3">{event.totalTransactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
