import { useOrganizerTransactionDetail } from "@/hooks/useOrganizerTransactionDetail";
import { useParams, Link } from "react-router";

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

export default function OrganizerTransactionDetailPage() {
  const { transactionId } = useParams();

  const { data, isPending, isError, refetch } = useOrganizerTransactionDetail(
    transactionId ?? "",
  );

  if (isPending) {
    return <p className="p-6">Memuat detail transaksi...</p>;
  }

  if (isError || !data) {
    return (
      <main className="space-y-4 p-6">
        <p>Gagal memuat detail transaksi.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded border px-4 py-2"
        >
          Coba Lagi
        </button>
        <div>
          <Link to="/organizer/transactions">Kembali ke daftar transaksi</Link>
        </div>
      </main>
    );
  }

  const transaction = data.data;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link
        to="/organizer/transactions"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Kembali ke daftar transaksi
      </Link>

      <header>
        <h1 className="text-2xl font-bold">Detail Transaksi</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kode: {transaction.transactionCode}
        </p>
      </header>

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-semibold">Informasi Transaksi</h2>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Status</dt>
            <dd className="font-medium">
              {statusLabels[transaction.status] ?? transaction.status}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-gray-500">Tanggal Transaksi</dt>
            <dd>{formatDate(transaction.createdAt)}</dd>
          </div>

          <div>
            <dt className="text-sm text-gray-500">Batas Pembayaran</dt>
            <dd>{formatDate(transaction.paymentProofDeadline)}</dd>
          </div>

          <div>
            <dt className="text-sm text-gray-500">Batas Konfirmasi Admin</dt>
            <dd>{formatDate(transaction.adminConfirmationDeadline)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-semibold">Data Pembeli</h2>
        <p className="font-medium">{transaction.user.name}</p>
        <p className="text-sm text-gray-500">{transaction.user.email}</p>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-semibold">Informasi Event</h2>
        <p className="font-medium">{transaction.event.name}</p>
        <p className="text-sm text-gray-500">{transaction.event.location}</p>
        <p className="mt-1 text-sm">
          Mulai: {formatDate(transaction.event.startDate)}
        </p>
        <p className="text-sm">
          Selesai: {formatDate(transaction.event.endDate)}
        </p>
      </section>

      <section className="overflow-x-auto rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-semibold">Rincian Tiket</h2>

        <table className="w-full min-w-112.5 text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Jenis Tiket</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Jumlah</th>
              <th className="p-3">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {transaction.items.map((item) => (
              <tr key={item.ticketId} className="border-t">
                <td className="p-3">{item.ticket.name}</td>
                <td className="p-3 whitespace-nowrap">
                  {formatCurrency(item.price)}
                </td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3 whitespace-nowrap">
                  {formatCurrency(item.subTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-5 max-w-sm space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(transaction.subTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Diskon Poin</dt>
            <dd>{formatCurrency(transaction.pointDiscount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Diskon Voucher</dt>
            <dd>{formatCurrency(transaction.voucherDiscount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Diskon Kupon</dt>
            <dd>{formatCurrency(transaction.couponDiscount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-3 text-base font-bold">
            <dt>Total Pembayaran</dt>
            <dd>{formatCurrency(transaction.totalAmount)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-semibold">Bukti Pembayaran</h2>

        {transaction.paymentProof ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Diunggah: {formatDate(transaction.paymentProof.uploadedAt)}
            </p>
            <a
              href={transaction.paymentProof.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-blue-600 hover:underline"
            >
              Lihat Bukti Pembayaran
            </a>
            <img
              src={transaction.paymentProof.fileUrl}
              alt="Bukti pembayaran transaksi"
              className="max-h-125 max-w-full rounded-lg border object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Pembeli belum mengunggah bukti pembayaran.
          </p>
        )}
      </section>
    </main>
  );
}
