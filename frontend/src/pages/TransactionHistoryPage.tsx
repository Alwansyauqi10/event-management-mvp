
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  getMyTransactions,
  type MyTransaction,
} from "@/services/transaction.service";

type StatusFilter =
  | "ALL"
  | "WAITING_FOR_PAYMENT"
  | "WAITING_FOR_ADMIN_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

const STATUS_LABELS: Record<string, string> = {
  WAITING_FOR_PAYMENT: "Menunggu Pembayaran",
  WAITING_FOR_ADMIN_CONFIRMATION: "Menunggu Konfirmasi",
  DONE: "Pembayaran Dikonfirmasi",
  REJECTED: "Pembayaran Ditolak",
  EXPIRED: "Kedaluwarsa",
  CANCELED: "Dibatalkan",
};

const STATUS_STYLES: Record<string, string> = {
  WAITING_FOR_PAYMENT: "bg-amber-100 text-amber-800",
  WAITING_FOR_ADMIN_CONFIRMATION: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-slate-200 text-slate-700",
  CANCELED: "bg-slate-200 text-slate-700",
};

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as { response?: { data?: { message?: string } } }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return "Riwayat transaksi gagal dimuat. Silakan coba lagi.";
};

export default function TransactionsHistoryPage() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<MyTransaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTransactions = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getMyTransactions();
      setTransactions(data);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const fetchTransactions = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyTransactions();

        if (isActive) {
          setTransactions(data);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchTransactions();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "ALL") {
      return transactions;
    }

    return transactions.filter(
      (transaction) => transaction.status === activeFilter,
    );
  }, [transactions, activeFilter]);

  const filterOptions: { label: string; value: StatusFilter }[] = [
    { label: "Semua", value: "ALL" },
    { label: "Menunggu Bayar", value: "WAITING_FOR_PAYMENT" },
    {
      label: "Menunggu Konfirmasi",
      value: "WAITING_FOR_ADMIN_CONFIRMATION",
    },
    { label: "Selesai", value: "DONE" },
    { label: "Ditolak", value: "REJECTED" },
    { label: "Kedaluwarsa", value: "EXPIRED" },
    { label: "Dibatalkan", value: "CANCELED" },
  ];

  const handleContinuePayment = (transaction: MyTransaction) => {
    navigate(`/payment/${transaction.id}`, {
      state: {
        transaction: {
          id: transaction.id,
          transactionCode: transaction.transactionCode,
          status: transaction.status,
          totalAmount: transaction.totalAmount,
          paymentProofDeadline: transaction.paymentProofDeadline,
        },
      },
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-800"
        >
          ← Kembali ke Home
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Riwayat Transaksi
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pantau pembayaran dan status transaksi event kamu.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total transaksi</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {transactions.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Seluruh transaksi yang tercatat di akun kamu.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveFilter(option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeFilter === option.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Memuat riwayat transaksi...
            </p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-semibold text-red-900">
              Riwayat transaksi gagal dimuat
            </h2>

            <p className="mt-2 text-sm text-red-800">{errorMessage}</p>

            <button
              type="button"
              onClick={() => void loadTransactions()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && transactions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100">
              <span className="text-2xl">↗</span>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Belum ada transaksi
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Transaksi event kamu akan muncul di halaman ini.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Jelajahi Event
            </button>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          transactions.length > 0 &&
          filteredTransactions.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h2 className="font-semibold text-slate-900">
                Tidak ada transaksi pada status ini
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Coba pilih filter status yang lain.
              </p>
            </div>
          )}

        {!isLoading && !errorMessage && filteredTransactions.length > 0 && (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const canContinue =
                transaction.status === "WAITING_FOR_PAYMENT";

              return (
                <article
                  key={transaction.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[transaction.status] ??
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {STATUS_LABELS[transaction.status] ??
                          transaction.status}
                      </span>

                      <h2 className="mt-3 text-lg font-bold text-slate-900">
                        {transaction.event.name}
                      </h2>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        {transaction.transactionCode}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        Tanggal transaksi: {formatDate(transaction.createdAt)}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Lokasi: {transaction.event.location || "-"}
                      </p>
                    </div>

                    <div className="sm:min-w-40 sm:text-right">
                      <p className="text-xs text-slate-500">
                        Total pembayaran
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-900">
                        {formatPrice(transaction.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="my-5 border-t border-slate-100" />

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Detail tiket
                    </h3>

                    <div className="mt-3 space-y-3">
                      {transaction.items.map((item, index) => (
                        <div
                          key={`${item.ticketId}-${index}`}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              {item.ticket.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.quantity} tiket ×{" "}
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          <p className="shrink-0 font-medium text-slate-700">
                            {formatPrice(item.subTotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {canContinue && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-900">
                        Transaksi ini masih menunggu pembayaran.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleContinuePayment(transaction)}
                        className="mt-3 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Lanjutkan Pembayaran
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
