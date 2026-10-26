
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "@/lib/axios";
import { createTransaction } from "@/services/transaction.service";

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

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pointsToUse, setPointsToUse] = useState("0");
  const [pointBalance, setPointBalance] = useState("0");
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [pointBalanceError, setPointBalanceError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchPointBalance = async () => {
      try {
        const response = await api.get<PointBalanceResponse>(
          "/referral/points",
        );

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

  if (
    !state?.event ||
    !Array.isArray(state.tickets) ||
    state.tickets.length === 0
  ) {
    return (
      <main className="min-h-screen bg-white px-6 pt-28">
        <div className="mx-auto max-w-2xl rounded-2xl border p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            No tickets selected
          </h1>
          <p className="mt-3 text-slate-600">
            Choose your tickets from the event page before checking out.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
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

  // Gunakan BigInt untuk menghitung nominal agar konsisten dengan backend.
  const subtotal = tickets.reduce(
    (total, ticket) =>
      total + BigInt(String(ticket.price)) * BigInt(ticket.quantity),
    0n,
  );

  const requestedPoints =
    /^\d+$/.test(pointsToUse) ? BigInt(pointsToUse) : 0n;

  const availablePoints =
    /^\d+$/.test(pointBalance) ? BigInt(pointBalance) : 0n;

  const pointsExceedBalance = requestedPoints > availablePoints;
  const pointsExceedSubtotal = requestedPoints > subtotal;

  const pointDiscount = pointsExceedSubtotal
    ? subtotal
    : requestedPoints;

  const totalAfterPoints = subtotal - pointDiscount;

  const isPointInputInvalid =
    pointsToUse.trim() === "" ||
    !/^\d+$/.test(pointsToUse) ||
    pointsExceedBalance ||
    pointsExceedSubtotal;

  const handleContinueToPayment = async () => {
    if (isSubmitting || isLoadingPoints) return;

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
      });

      const transaction = response.transaction;

      navigate(`/payment/${transaction.id}`, {
        state: {
          transaction: {
            id: transaction.id,
            transactionCode: transaction.transactionCode,
            status: transaction.status,
            totalAmount: transaction.totalAmount,
            paymentProofDeadline:
              transaction.paymentProofDeadline ?? null,
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
    <main className="min-h-screen bg-slate-50 px-6 pb-16 pt-28">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to event
        </button>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Checkout
        </h1>
        <p className="mt-2 text-slate-600">
          Review your ticket selection before continuing.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            {event.image && (
              <img
                src={event.image}
                alt={event.name}
                className="mb-5 h-48 w-full rounded-xl object-cover"
              />
            )}

            <h2 className="text-xl font-bold text-slate-900">
              {event.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {event.location}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {new Date(event.startDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>

            <div className="my-6 border-t border-slate-200" />

            <h3 className="font-semibold text-slate-900">
              Selected tickets
            </h3>

            <div className="mt-4 space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {ticket.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatPrice(ticket.price)} × {ticket.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">
                    {formatPrice(
                      BigInt(String(ticket.price)) *
                        BigInt(ticket.quantity),
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-5 flex justify-between gap-4 text-sm text-slate-600">
              <span>Total tickets</span>
              <span className="font-medium text-slate-900">
                {totalQuantity}
              </span>
            </div>

            <div className="mt-4 flex justify-between gap-4">
              <span className="font-medium text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="my-5 border-t border-slate-200" />

            <section>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">
                  Use Points
                </h3>
                <span className="text-xs text-slate-500">
                  1 point = Rp1
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Available balance:{" "}
                {isLoadingPoints ? "Loading..." : `${pointBalance} points`}
              </p>

              {pointBalanceError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
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
                onChange={(inputEvent) => {
                  const value = inputEvent.target.value;

                  if (/^\d*$/.test(value)) {
                    setPointsToUse(value);
                    setErrorMessage("");
                  }
                }}
                disabled={isLoadingPoints || Boolean(pointBalanceError)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              {pointsExceedBalance && (
                <p className="mt-2 text-sm text-red-600">
                  Saldo poin tidak mencukupi.
                </p>
              )}

              {pointsExceedSubtotal && (
                <p className="mt-2 text-sm text-red-600">
                  Poin tidak boleh melebihi subtotal.
                </p>
              )}
            </section>

            <div className="my-5 border-t border-slate-200" />

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">Point discount</span>
              <span className="font-medium text-green-700">
                -{formatPrice(pointDiscount)}
              </span>
            </div>

            <div className="mt-4 flex justify-between gap-4">
              <span className="font-semibold text-slate-900">
                Total payment
              </span>
              <span className="text-xl font-bold text-slate-900">
                {formatPrice(totalAfterPoints)}
              </span>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
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
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isSubmitting
                ? "Creating Transaction..."
                : "Continue to Payment"}
            </button>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Ticket availability, point balance, and final payment amount
              are verified by the server.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
