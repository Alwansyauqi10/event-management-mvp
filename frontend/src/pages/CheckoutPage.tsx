import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "@/lib/axios";
import {
  createTransaction,
  getMyCoupons,
  type AvailableCoupon,
} from "@/services/transaction.service";

type CheckoutTicket = {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
};

type CheckoutState = {
  event: {
    id: string;
    name: string;
    image?: string | null;
    location: string;
    startDate: string;
  };
  tickets: CheckoutTicket[];
};

type PointBalanceResponse = {
  points: string;
  message?: string;
};

const formatPrice = (price: string | number | bigint) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return "Transaksi gagal dibuat. Silakan coba lagi.";
};

function TicketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M4 8a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8v1m0 3v1m0 3v1m4-8h3m-3 4h3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [pointsToUse, setPointsToUse] = useState("0");
  const [pointBalance, setPointBalance] = useState("0");
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [pointBalanceError, setPointBalanceError] = useState("");

  const [voucherCode, setVoucherCode] = useState("");
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchPointBalance = async () => {
      try {
        const response =
          await api.get<PointBalanceResponse>("/referral/points");

        if (!active) return;

        setPointBalance(response.data.points ?? "0");
        setPointBalanceError("");
      } catch (error) {
        if (!active) return;

        setPointBalance("0");
        setPointBalanceError(
          getErrorMessage(error) ===
            "Transaksi gagal dibuat. Silakan coba lagi."
            ? "Saldo poin tidak dapat dimuat. Coba muat ulang halaman."
            : getErrorMessage(error),
        );
      } finally {
        if (active) {
          setIsLoadingPoints(false);
        }
      }
    };

    void fetchPointBalance();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchCoupons = async () => {
      try {
        const data = await getMyCoupons();

        if (active) {
          setCoupons(data);
        }
      } catch (error) {
        console.error("Gagal memuat kupon:", error);

        if (active) {
          setCoupons([]);
        }
      } finally {
        if (active) {
          setIsLoadingCoupons(false);
        }
      }
    };

    void fetchCoupons();

    return () => {
      active = false;
    };
  }, []);

  if (
    !state?.event ||
    !Array.isArray(state.tickets) ||
    state.tickets.length === 0
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <TicketIcon />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            No tickets selected
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Choose your tickets from the event page before checking out.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-haya-blue px-5 py-3 font-semibold text-white transition hover:bg-haya-blue-light"
          >
            Browse Events
          </button>
        </div>
      </main>
    );
  }

  const { event, tickets } = state;

  const totalQuantity = tickets.reduce(
    (total, ticket) => total + ticket.quantity,
    0,
  );

  const subtotal = tickets.reduce(
    (total, ticket) =>
      total + BigInt(String(ticket.price)) * BigInt(ticket.quantity),
    0n,
  );

  const requestedPoints = /^\d+$/.test(pointsToUse) ? BigInt(pointsToUse) : 0n;

  const availablePoints = /^\d+$/.test(pointBalance)
    ? BigInt(pointBalance)
    : 0n;

  const pointsExceedBalance = requestedPoints > availablePoints;
  const pointsExceedSubtotal = requestedPoints > subtotal;

  const pointDiscount = pointsExceedSubtotal ? subtotal : requestedPoints;
  const totalAfterPoints = subtotal - pointDiscount;

  const isPointInputInvalid =
    pointsToUse.trim() === "" ||
    !/^\d+$/.test(pointsToUse) ||
    pointsExceedBalance ||
    pointsExceedSubtotal;

  const selectedCoupon = coupons.find(
    (coupon) => coupon.id === selectedCouponId,
  );

  const handleContinueToPayment = async () => {
    if (isSubmitting || isLoadingPoints) return;

    if (pointBalanceError) {
      setErrorMessage("Saldo poin belum tersedia. Coba muat ulang halaman.");
      return;
    }

    if (isPointInputInvalid) {
      setErrorMessage(
        pointsExceedBalance
          ? "Saldo poin tidak mencukupi."
          : pointsExceedSubtotal
            ? "Poin yang digunakan tidak boleh melebihi subtotal."
            : "Jumlah poin tidak valid.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await createTransaction({
        eventId: event.id,
        tickets: tickets.map((ticket) => ({
          ticketId: ticket.id,
          quantity: ticket.quantity,
        })),
        pointsToUse: requestedPoints.toString(),
        voucherCode: voucherCode.trim() || undefined,
        couponId: selectedCouponId || undefined,
      });

      const transaction = response.transaction;

      navigate(`/payment/${transaction.id}`, {
        state: {
          transaction: {
            id: transaction.id,
            transactionCode: transaction.transactionCode,
            status: transaction.status,
            totalAmount: transaction.totalAmount,
            paymentProofDeadline: transaction.paymentProofDeadline ?? null,
          },
        },
      });
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-haya-blue transition hover:text-haya-blue-light"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="m15 18-6-6 6-6M9 12h12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to event
        </button>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-haya-blue">
            Secure checkout
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review your ticket selection and apply your available discounts
            before continuing to payment.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          {/* Event and tickets */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="h-52 w-full object-cover sm:h-64"
              />
            ) : (
              <div className="flex h-44 items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 text-haya-blue">
                <TicketIcon />
              </div>
            )}

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-haya-blue">
                  Event ticket
                </span>
                <span className="text-xs text-slate-400">
                  {totalQuantity} ticket{totalQuantity > 1 ? "s" : ""}
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {event.name}
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
                    aria-hidden="true"
                  >
                    <path
                      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  <span>{event.location}</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
                  </svg>
                  <span>{formatDate(event.startDate)}</span>
                </div>
              </div>

              <div className="my-7 border-t border-slate-100" />

              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900">
                  Selected tickets
                </h3>
                <span className="text-sm text-slate-500">
                  {totalQuantity} selected
                </span>
              </div>

              <div className="mt-5 divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                        <TicketIcon />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {ticket.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatPrice(ticket.price)} × {ticket.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-right font-bold text-slate-900">
                      {formatPrice(
                        BigInt(String(ticket.price)) * BigInt(ticket.quantity),
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Order summary */}
          <aside className="h-fit min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Order Summary
              </h2>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-haya-blue">
                {totalQuantity} tiket
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="my-5 border-t border-slate-100" />

            {/* Voucher */}
            <section>
              <label
                htmlFor="voucherCode"
                className="block text-sm font-semibold text-slate-900"
              >
                Kode Voucher
              </label>

              <div className="relative mt-2">
                <input
                  id="voucherCode"
                  type="text"
                  value={voucherCode}
                  onChange={(event) => {
                    setVoucherCode(event.target.value.toUpperCase());
                    setErrorMessage("");
                  }}
                  placeholder="Masukkan kode voucher"
                  maxLength={100}
                  autoComplete="off"
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm uppercase text-slate-900 outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Voucher akan divalidasi saat transaksi dibuat.
              </p>
            </section>

            <div className="my-5 border-t border-slate-100" />

            {/* Referral coupon */}
            <section>
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="couponId"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Kupon Diskon
                </label>

                {selectedCouponId && (
                  <button
                    type="button"
                    onClick={() => setSelectedCouponId("")}
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                  >
                    Hapus pilihan
                  </button>
                )}
              </div>

              <select
                id="couponId"
                value={selectedCouponId}
                onChange={(event) => {
                  setSelectedCouponId(event.target.value);
                  setErrorMessage("");
                }}
                disabled={isLoadingCoupons || coupons.length === 0}
                className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {isLoadingCoupons
                    ? "Memuat kupon..."
                    : coupons.length === 0
                      ? "Belum ada kupon tersedia"
                      : "Pilih kupon diskon"}
                </option>

                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.discountType === "PERCENTAGE"
                      ? `Diskon ${coupon.discountValue}%`
                      : `Diskon ${formatPrice(coupon.discountValue)}`}
                  </option>
                ))}
              </select>

              {selectedCoupon && (
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                    <TicketIcon />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      Kupon Referral
                    </p>

                    <p className="mt-1 text-sm font-bold text-blue-700">
                      {selectedCoupon.discountType === "PERCENTAGE"
                        ? `Diskon ${selectedCoupon.discountValue}%`
                        : `Diskon ${formatPrice(selectedCoupon.discountValue)}`}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Berlaku sampai {formatDate(selectedCoupon.endAt)}
                    </p>
                  </div>
                </div>
              )}

              {!selectedCoupon && !isLoadingCoupons && coupons.length === 0 && (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Belum ada kupon referral aktif yang bisa digunakan.
                </p>
              )}

              {coupons.length > 0 && (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Pilih kupon referral yang ingin digunakan untuk transaksi ini.
                </p>
              )}
            </section>

            <div className="my-5 border-t border-slate-100" />

            {/* Points */}
            <section className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">Use Points</h3>
                <span className="text-xs text-slate-500">1 point = Rp1</span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Available balance
                </span>
                <span className="text-right text-sm font-semibold text-slate-900">
                  {isLoadingPoints
                    ? "Loading..."
                    : `${Number(pointBalance).toLocaleString("id-ID")} points`}
                </span>
              </div>

              {pointBalanceError && (
                <p role="alert" className="mt-3 text-xs leading-5 text-red-600">
                  {pointBalanceError}
                </p>
              )}

              <label
                htmlFor="pointsToUse"
                className="mt-4 block text-sm font-medium text-slate-700"
              >
                Points to use
              </label>

              <input
                id="pointsToUse"
                type="number"
                min="0"
                max={pointBalance}
                step="1"
                inputMode="numeric"
                value={pointsToUse}
                onChange={(event) => {
                  const value = event.target.value;

                  if (/^\d*$/.test(value)) {
                    setPointsToUse(value);
                    setErrorMessage("");
                  }
                }}
                disabled={isLoadingPoints || Boolean(pointBalanceError)}
                className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
              />

              {pointsExceedBalance && (
                <p className="mt-2 text-xs text-red-600">
                  Saldo poin tidak mencukupi.
                </p>
              )}

              {pointsExceedSubtotal && (
                <p className="mt-2 text-xs text-red-600">
                  Poin tidak boleh melebihi subtotal.
                </p>
              )}
            </section>

            {/* Total */}
            <div className="my-5 border-t border-slate-100" />

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">Point discount</span>
              <span className="font-semibold text-emerald-700">
                -{formatPrice(pointDiscount)}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-600">
                  Total payment
                </span>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  {formatPrice(totalAfterPoints)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleContinueToPayment}
              disabled={
                isSubmitting ||
                isLoadingPoints ||
                Boolean(pointBalanceError) ||
                isPointInputInvalid
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-haya-blue px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-haya-blue-light disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Creating Transaction...
                </>
              ) : (
                <>
                  Continue to Payment
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>

            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" />
              </svg>
              <p>
                Ticket availability, voucher validity, coupon eligibility, point
                balance, and the final payment amount are verified by the
                server.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;
