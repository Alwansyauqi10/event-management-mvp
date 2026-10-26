import { useOrganizerTransactions } from "@/hooks/useOrganizerTransaction";
import type { TransactionStatus } from "@/types/organizerDashboard";
import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  ReceiptText,
  RotateCw,
} from "lucide-react";

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

const statusStyles: Record<TransactionStatus, string> = {
  WAITING_FOR_PAYMENT: "bg-amber-50 text-amber-700",
  WAITING_FOR_ADMIN_CONFIRMATION: "bg-violet-50 text-violet-700",
  DONE: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  EXPIRED: "bg-slate-100 text-slate-600",
  CANCELED: "bg-rose-50 text-rose-700",
};

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

function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

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
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-200" />
          </div>
          <div className="h-20 rounded-xl border border-slate-200 bg-white" />
          <div className="h-96 rounded-xl border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ReceiptText size={22} />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Transaksi gagal dimuat
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ada kendala saat mengambil daftar transaksi. Silakan coba lagi.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <RotateCw size={16} />
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  const totalTransactions = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.page ?? page;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm text-slate-500">Ruang kerja organizer</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Manajemen Transaksi
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Periksa pembayaran dan kelola transaksi dari event yang kamu
            selenggarakan.
          </p>
        </header>

        {/* Summary */}
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ReceiptText size={21} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total transaksi</p>
              <p className="text-xl font-semibold text-slate-900">
                {totalTransactions.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {isFetching && (
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <RotateCw size={14} className="animate-spin" />
              Memperbarui data...
            </span>
          )}
        </section>

        {/* Filter */}
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter size={17} className="text-slate-500" />
            Filter transaksi
          </div>

          <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm text-slate-500">Status</span>
            <select
              className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:w-72"
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
        </section>

        {/* Transaction List */}
        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900">
              Daftar transaksi
            </h2>
            <p className="text-sm text-slate-500">
              {status
                ? `Menampilkan transaksi dengan status ${getStatusLabel(status).toLowerCase()}.`
                : "Semua transaksi dari event yang kamu kelola."}
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <ReceiptText size={23} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                Belum ada transaksi
              </h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                {status
                  ? "Tidak ada transaksi dengan status ini. Coba pilih status lain."
                  : "Transaksi dari peserta event kamu akan muncul di sini."}
              </p>

              {status && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus("");
                    setPage(1);
                  }}
                  className="mt-4 text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-950"
                >
                  Hapus filter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-237 text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500">
                    <th className="px-5 py-3.5 font-medium sm:px-6">
                      Kode transaksi
                    </th>
                    <th className="px-5 py-3.5 font-medium">Pembeli</th>
                    <th className="px-5 py-3.5 font-medium">Event</th>
                    <th className="px-5 py-3.5 font-medium">Tanggal</th>
                    <th className="px-5 py-3.5 font-medium">Total</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 text-right font-medium sm:px-6">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <p className="whitespace-nowrap font-medium text-slate-900">
                          {transaction.transactionCode}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-48 truncate font-medium text-slate-800">
                          {transaction.user.name}
                        </p>
                        <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                          {transaction.user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-52 truncate text-slate-700">
                          {transaction.event.name}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(transaction.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium tabular-nums text-slate-900">
                        {formatCurrency(transaction.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <TransactionStatusBadge status={transaction.status} />
                      </td>

                      <td className="px-5 py-4 text-right sm:px-6">
                        <Link
                          to={`/organizer/transactions/${transaction.id}`}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                          Detail
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {transactions.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Total {totalTransactions.toLocaleString("id-ID")} transaksi
                <span className="mx-2 text-slate-300">·</span>
                Halaman {currentPage} dari {Math.max(totalPages, 1)}
              </p>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft size={16} />
                  Sebelumnya
                </button>

                <span className="whitespace-nowrap text-sm tabular-nums text-slate-600">
                  {currentPage} / {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Berikutnya
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="pb-2 text-center text-xs text-slate-400">
          HAYA · Manajemen Transaksi
        </p>
      </div>
    </main>
  );
}
