import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  getMyTransactions,
  type MyTransaction,
} from "@/services/transaction.service";
import { api } from "@/lib/axios";

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
    const response = (error as { response?: { data?: { message?: string } } })
      .response;

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
  const [reviewFormId, setReviewFormId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

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
  const handleSubmitReview = async (transactionId: string) => {
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Pilih rating dari 1 sampai 5.");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      await api.post(`/event-reviews/transactions/${transactionId}`, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });

      // Ambil ulang transaksi supaya rating dan komentar terbaru tampil.
      const updatedTransactions = await getMyTransactions();
      setTransactions(updatedTransactions);

      setReviewFormId(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (error: any) {
      setReviewError(
        error?.response?.data?.message ??
          "Review gagal dikirim. Silakan coba lagi.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Riwayat Transaksi
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pantau pembayaran dan status transaksi event kamu.
          </p>
        </div>

        <div className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total transaksi
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {transactions.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Seluruh transaksi yang tercatat di akun kamu.
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-700">
            ↗
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setActiveFilter(option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeFilter === option.value
                    ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                    : "border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
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
              const canContinue = transaction.status === "WAITING_FOR_PAYMENT";

              return (
                <article
                  key={transaction.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
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

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                            STATUS_STYLES[transaction.status] ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {STATUS_LABELS[transaction.status] ??
                            transaction.status}
                        </span>

                        {transaction.status === "DONE" &&
                          (transaction.checkedInAt ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <span aria-hidden="true">✓</span> Sudah Check-in
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                              <span aria-hidden="true">◷</span> Belum Check-in
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="sm:min-w-40 sm:text-right">
                      <p className="text-xs text-slate-500">Total pembayaran</p>

                      <p className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
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
                              {item.quantity} tiket × {formatPrice(item.price)}
                            </p>
                          </div>

                          <p className="shrink-0 font-medium text-slate-700">
                            {formatPrice(item.subTotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Event Review & Rating */}
                  </div>
                  <section className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                        ★
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Review & Rating
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Bagikan pengalaman event kamu
                        </p>
                      </div>
                    </div>

                    {!transaction.checkedInAt ? (
                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
                        <span className="mt-0.5 text-slate-400">◷</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Review tersedia setelah check-in
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Penyelenggara perlu mengonfirmasi kehadiran kamu
                            terlebih dahulu.
                          </p>
                        </div>
                      </div>
                    ) : transaction.review ? (
                      <div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, index) => (
                            <span
                              key={index}
                              className={
                                index < transaction.review!.rating
                                  ? "text-amber-400"
                                  : "text-slate-200"
                              }
                            >
                              ★
                            </span>
                          ))}

                          <span className="ml-2 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {transaction.review.rating}/5
                          </span>
                        </div>

                        {transaction.review.comment && (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {transaction.review.comment}
                          </p>
                        )}

                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <span aria-hidden="true">✓</span> Review Terkirim
                            </span>
                      </div>
                    ) : (
                      <div>
                        {reviewFormId !== transaction.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewFormId(transaction.id);
                              setReviewRating(5);
                              setReviewComment("");
                              setReviewError("");
                            }}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                          >
                            Beri Review & Rating
                          </button>
                        ) : (
                          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">
                                Rating
                              </label>

                              <div className="flex gap-2">
                                {Array.from({ length: 5 }, (_, index) => {
                                  const rating = index + 1;

                                  return (
                                    <button
                                      key={rating}
                                      type="button"
                                      aria-label={`Rating ${rating}`}
                                      aria-pressed={reviewRating === rating}
                                      onClick={() => setReviewRating(rating)}
                                      className={`rounded-lg px-0.5 text-3xl transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                                        rating <= reviewRating
                                          ? "text-amber-400"
                                          : "text-slate-200 hover:text-amber-200"
                                      }`}
                                    >
                                      ★
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor={`review-comment-${transaction.id}`}
                                className="mb-2 block text-sm font-medium text-slate-700"
                              >
                                Komentar (opsional)
                              </label>

                              <textarea
                                id={`review-comment-${transaction.id}`}
                                value={reviewComment}
                                onChange={(event) =>
                                  setReviewComment(event.target.value)
                                }
                                maxLength={5000}
                                rows={3}
                                placeholder="Ceritakan pengalaman lu di event ini..."
                                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                              />
                            </div>

                            {reviewError && (
                              <p role="alert" className="text-sm text-red-600">
                                {reviewError}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={submittingReview}
                                onClick={() =>
                                  handleSubmitReview(transaction.id)
                                }
                                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {submittingReview
                                  ? "Mengirim..."
                                  : "Kirim Review"}
                              </button>

                              <button
                                type="button"
                                disabled={submittingReview}
                                onClick={() => {
                                  setReviewFormId(null);
                                  setReviewError("");
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>

                  {canContinue && (
                    <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 sm:p-5">
                      <p className="text-sm text-amber-900">
                        Transaksi ini masih menunggu pembayaran.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleContinuePayment(transaction)}
                        className="mt-3 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
