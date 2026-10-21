import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "@/lib/axios";

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

type CreatedTransaction = {
  id: string;
  transactionCode: string;
  status: string;
  totalAmount: string;
};

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdTransaction, setCreatedTransaction] =
    useState<CreatedTransaction | null>(null);

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

  const subtotal = tickets.reduce(
    (total, ticket) => total + Number(ticket.price) * ticket.quantity,
    0,
  );

  const handleContinueToPayment = async () => {
    if (isSubmitting || createdTransaction) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await api.post("/transactions", {
        eventId: event.id,
        tickets: tickets.map((ticket) => ({
          ticketId: ticket.id,
          quantity: ticket.quantity,
        })),
      });

      const transaction = response.data.transaction;

      setCreatedTransaction({
        id: String(transaction.id),
        transactionCode: String(transaction.transactionCode),
        status: String(transaction.status),
        totalAmount: String(transaction.totalAmount),
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      setErrorMessage(
        message || "Transaksi gagal dibuat. Silakan coba lagi.",
      );
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
                    {formatPrice(Number(ticket.price) * ticket.quantity)}
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

            <div className="my-5 border-t border-slate-200" />

            <div className="flex justify-between gap-4">
              <span className="font-medium text-slate-600">Subtotal</span>
              <span className="text-xl font-bold text-slate-900">
                {formatPrice(subtotal)}
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

            {createdTransaction ? (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <h3 className="font-semibold text-green-800">
                  Transaction created!
                </h3>
                <p className="mt-2 text-sm text-green-800">
                  Transaction code
                </p>
                <p className="break-all font-bold text-green-900">
                  {createdTransaction.transactionCode}
                </p>
                <p className="mt-2 text-sm text-green-800">
                  Status: {createdTransaction.status}
                </p>
                <p className="mt-1 text-sm text-green-800">
                  Total: {formatPrice(createdTransaction.totalAmount)}
                </p>
                <p className="mt-3 text-xs leading-5 text-green-800">
                  Transaksi berhasil dibuat. Tahap upload bukti pembayaran
                  belum terhubung.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleContinueToPayment}
                disabled={isSubmitting}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {isSubmitting
                  ? "Creating Transaction..."
                  : "Continue to Payment"}
              </button>
            )}

            {!createdTransaction && (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Your ticket availability and transaction will be checked by
                the server.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}