import { useState } from "react";
import { Link, useParams } from "react-router";
import { useAcceptOrganizerTransaction } from "@/hooks/useAcceptOrganizerTransaction";
import { useOrganizerTransactionDetail } from "@/hooks/useOrganizerTransactionDetail";
import { useRejectOrganizerTransaction } from "@/hooks/useRejectOrganizerTransaction";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileImage,
  MapPin,
  ReceiptText,
  UserRound,
  XCircle,
} from "lucide-react";

const formatCurrency = (value: string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(BigInt(value));

const formatDate = (value: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusLabels: Record<string, string> = {
  WAITING_FOR_PAYMENT: "Menunggu Pembayaran",
  WAITING_FOR_ADMIN_CONFIRMATION: "Menunggu Konfirmasi Admin",
  DONE: "Selesai",
  REJECTED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
  CANCELED: "Dibatalkan",
};

const statusStyles: Record<string, string> = {
  WAITING_FOR_PAYMENT: "bg-amber-50 text-amber-700 ring-amber-600/20",
  WAITING_FOR_ADMIN_CONFIRMATION:
    "bg-violet-50 text-violet-700 ring-violet-600/20",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-600/20",
  EXPIRED: "bg-slate-100 text-slate-600 ring-slate-500/20",
  CANCELED: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <dt className="text-sm text-slate-500">{label}</dt>
        <dd className="mt-1 wrap-break-words text-sm font-medium text-slate-800">
          {value}
        </dd>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof ReceiptText;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
        <Icon size={18} />
      </div>
      <h2 className="font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

export default function OrganizerTransactionDetailPage() {
  const { transactionId } = useParams();

  const { data, isPending, isError, refetch } = useOrganizerTransactionDetail(
    transactionId ?? "",
  );

  const { mutate: acceptTransaction, isPending: isAccepting } =
    useAcceptOrganizerTransaction();

  const { mutate: rejectTransaction, isPending: isRejecting } =
    useRejectOrganizerTransaction();

  const [confirmAction, setConfirmAction] = useState<
    "accept" | "reject" | null
  >(null);

  if (isPending) {
    return (
      <main className="min-h-full bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-4 w-48 rounded bg-slate-200" />
          <div className="h-20 rounded-xl bg-white ring-1 ring-slate-200" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-56 rounded-xl bg-white ring-1 ring-slate-200" />
            <div className="h-56 rounded-xl bg-white ring-1 ring-slate-200" />
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
          <XCircle className="mx-auto mb-3 text-rose-500" size={32} />
          <h1 className="font-semibold text-slate-900">
            Detail transaksi tidak tersedia
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Terjadi kendala saat memuat data transaksi.
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
              to="/organizer/transactions"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Kembali
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const transaction = data.data;

  const handleAcceptTransaction = () => {
    if (isAccepting || isRejecting) return;

    setConfirmAction("accept");
  };

  const handleRejectTransaction = () => {
    if (isAccepting || isRejecting) return;

    setConfirmAction("reject");
  };

  const handleConfirmAction = () => {
    if (confirmAction === "accept") {
      acceptTransaction(transaction.id, {
        onSuccess: () => setConfirmAction(null),
      });
    }

    if (confirmAction === "reject") {
      rejectTransaction(transaction.id, {
        onSuccess: () => setConfirmAction(null),
      });
    }
  };

  const isProcessing = isAccepting || isRejecting;

  return (
    <main className="min-h-full bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          to="/organizer/transactions"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Kembali ke daftar transaksi
        </Link>

        <header className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Manajemen Transaksi
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Detail Transaksi
            </h1>
            <p className="mt-2 break-all font-mono text-sm text-slate-500">
              {transaction.transactionCode}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={transaction.status} />
            {transaction.status === "WAITING_FOR_ADMIN_CONFIRMATION" && (
              <>
                <button
                  type="button"
                  onClick={handleRejectTransaction}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Tolak
                </button>
                <button
                  type="button"
                  onClick={handleAcceptTransaction}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Terima
                </button>
              </>
            )}
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <SectionHeading icon={ReceiptText} title="Informasi Transaksi" />

            <dl className="grid gap-5 sm:grid-cols-2">
              <DetailItem
                icon={CalendarDays}
                label="Tanggal Transaksi"
                value={formatDate(transaction.createdAt)}
              />
              <DetailItem
                icon={Clock3}
                label="Batas Pembayaran"
                value={formatDate(transaction.paymentProofDeadline)}
              />
              <DetailItem
                icon={Clock3}
                label="Batas Konfirmasi Admin"
                value={formatDate(transaction.adminConfirmationDeadline)}
              />
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <SectionHeading icon={UserRound} title="Data Pembeli" />
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                {transaction.user.name}
              </p>
              <p className="mt-1 break-all text-sm text-slate-500">
                {transaction.user.email}
              </p>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <SectionHeading icon={CalendarDays} title="Informasi Event" />

          <h3 className="text-lg font-semibold text-slate-900">
            {transaction.event.name}
          </h3>

          <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 shrink-0" size={16} />
            {transaction.event.location}
          </p>

          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <DetailItem
              icon={CalendarDays}
              label="Mulai Event"
              value={formatDate(transaction.event.startDate)}
            />
            <DetailItem
              icon={CalendarDays}
              label="Selesai Event"
              value={formatDate(transaction.event.endDate)}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="border-b border-slate-100 p-5 sm:px-6">
            <SectionHeading icon={ReceiptText} title="Rincian Tiket" />
            <p className="-mt-3 text-sm text-slate-500">
              Detail tiket yang dibeli dalam transaksi ini.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold sm:px-6">
                    Jenis Tiket
                  </th>
                  <th className="px-5 py-3.5 font-semibold">Harga</th>
                  <th className="px-5 py-3.5 font-semibold">Jumlah</th>
                  <th className="px-5 py-3.5 text-right font-semibold sm:px-6">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaction.items.map((item) => (
                  <tr key={item.ticketId}>
                    <td className="px-5 py-4 font-medium text-slate-800 sm:px-6">
                      {item.ticket.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-slate-800 sm:px-6">
                      {formatCurrency(item.subTotal)}
                    </td>
                  </tr>
                ))}
                {transaction.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Tidak ada rincian tiket.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
            <dl className="ml-auto max-w-sm space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Subtotal</dt>
                <dd className="text-right">
                  {formatCurrency(transaction.subTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Diskon Poin</dt>
                <dd className="text-right">
                  −{formatCurrency(transaction.pointDiscount)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Diskon Voucher</dt>
                <dd className="text-right">
                  −{formatCurrency(transaction.voucherDiscount)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Diskon Kupon</dt>
                <dd className="text-right">
                  −{formatCurrency(transaction.couponDiscount)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-slate-200 pt-4">
                <dt className="font-semibold text-slate-800">
                  Total Pembayaran
                </dt>
                <dd className="text-right text-lg font-bold text-slate-900">
                  {formatCurrency(transaction.totalAmount)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <SectionHeading icon={FileImage} title="Bukti Pembayaran" />

          {transaction.paymentProof ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Diunggah pada {formatDate(transaction.paymentProof.uploadedAt)}
              </p>

              <a
                href={transaction.paymentProof.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
              >
                Lihat gambar ukuran penuh
                <ExternalLink size={15} />
              </a>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-5">
                <img
                  src={transaction.paymentProof.fileUrl}
                  alt="Bukti pembayaran transaksi"
                  className="mx-auto max-h-125 max-w-full rounded-md object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center">
              <FileImage className="mx-auto mb-3 text-slate-400" size={30} />
              <p className="text-sm font-medium text-slate-700">
                Belum ada bukti pembayaran
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Pembeli belum mengunggah bukti pembayaran.
              </p>
            </div>
          )}
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          HAYA · Manajemen Transaksi
        </footer>
      </div>

      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onClick={() => !isProcessing && setConfirmAction(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-confirm-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`mb-4 flex size-11 items-center justify-center rounded-full ${
                confirmAction === "accept"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {confirmAction === "accept" ? (
                <CheckCircle2 size={22} />
              ) : (
                <XCircle size={22} />
              )}
            </div>

            <h2
              id="transaction-confirm-title"
              className="text-lg font-semibold text-slate-900"
            >
              {confirmAction === "accept"
                ? "Terima transaksi ini?"
                : "Tolak transaksi ini?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {confirmAction === "accept"
                ? "Pastikan bukti pembayaran sudah diperiksa sebelum menerima transaksi."
                : "Transaksi akan ditolak. Pastikan kamu sudah memeriksa bukti pembayaran sebelum melanjutkan."}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setConfirmAction(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  confirmAction === "accept"
                    ? "bg-slate-900 hover:bg-slate-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isProcessing
                  ? "Memproses..."
                  : confirmAction === "accept"
                    ? "Ya, Terima"
                    : "Ya, Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
