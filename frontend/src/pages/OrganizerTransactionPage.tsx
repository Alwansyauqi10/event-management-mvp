import { useOrganizerTransactions } from "@/hooks/useOrganizerTransaction";
import type { TransactionStatus } from "@/lib/axios";
import { useState } from "react";

const statusOptions: {
  value: TransactionStatus;
  label: string;
}[] = [
  { value: "WAITING_FOR_PAYMENT", label: "Menunggu Pembayaran" },
  {
    value: "WAITING_FOR_ADMIN_CONFIRMATION",
    label: "Menunggu Konfirmasi Admin",
  },
  { value: "DONE", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "EXPIRED", label: "Kedaluwarsa" },
  { value: "CANCELED", label: "Dibatalkan" },
];

const formatCurrency = (value: string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(BigInt(value));

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getStatusLabel = (status: TransactionStatus) =>
  statusOptions.find((item) => item.value === status)?.label ?? status;

export default function OrganizerTransactionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TransactionStatus | "">("");

  const { data, isPending, isError, refetch, isFetching } =
    useOrganizerTransactions({
      page,
      limit: 10,
      status: status || undefined,
    });

  const transactions = data?.data.transactions ?? [];
  const pagination = data?.data.pagination;

  if (isPending) {
    return <p>Memuat daftar transaksi...</p>;
  }

  if (isError) {
    return (
      <div>
        <p>Gagal memuat daftar transaksi.</p>
        <button type="button" onClick={() => refetch()}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Transaksi</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lihat transaksi pada event yang kamu selenggarakan.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2">
          <span className="text-sm">Filter status:</span>
          <select
            className="rounded-md border border-gray-300 p-2"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as TransactionStatus | "");
              setPage(1);
            }}
          >
            <option value="">Semua status</option>
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {isFetching && (
          <span className="text-sm text-gray-500">Memperbarui data...</span>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="font-semibold">Belum ada transaksi</h2>
          <p className="mt-1 text-sm text-gray-500">
            Transaksi yang sesuai dengan filter akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-212.5 text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Kode Transaksi</th>
                <th className="p-3">Pembeli</th>
                <th className="p-3">Event</th>
                <th className="p-3">Tanggal Transaksi</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-gray-200">
                  <td className="p-3 font-medium">
                    {transaction.transactionCode}
                  </td>
                  <td className="p-3">
                    <div>{transaction.user.name}</div>
                    <div className="text-xs text-gray-500">
                      {transaction.user.email}
                    </div>
                  </td>
                  <td className="p-3">{transaction.event.name}</td>
                  <td className="p-3">{formatDate(transaction.createdAt)}</td>
                  <td className="p-3 whitespace-nowrap">
                    {formatCurrency(transaction.totalAmount)}
                  </td>
                  <td className="p-3">{getStatusLabel(transaction.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Total transaksi: {pagination?.total ?? 0}
          {" · "}
          Halaman {pagination?.page ?? page} dari {pagination?.totalPages ?? 0}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => current - 1)}
          >
            Sebelumnya
          </button>

          <button
            type="button"
            className="rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= (pagination?.totalPages ?? 0) || isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </main>
  );
}
