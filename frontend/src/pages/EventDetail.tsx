
import { useState } from "react";
import { useParams } from "react-router";
import { useEventById } from "@/hooks/useEvent";
import { useEventTickets } from "@/hooks/useEventTickets";

function EventDetailPage() {
  const { id } = useParams();
  const eventId = id ?? "";

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (ticketId: string, quantity: number) => {
    setQuantities((previous) => ({
      ...previous,
      [ticketId]: quantity,
    }));
  };

  const { data, isLoading, isError } = useEventById(eventId);

  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
  } = useEventTickets(eventId);

  if (isLoading) {
    return (
      <div className="px-6 py-16 text-center text-slate-500">
        Loading event...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-16 text-center text-red-600">
        Failed to load event.
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="px-6 py-16 text-center text-slate-500">
        Event not found.
      </div>
    );
  }

  const event = data.data;
  const tickets = ticketsData?.data ?? [];

  const selectedTickets = tickets.filter(
    (ticket) => (quantities[ticket.id] ?? 0) > 0,
  );

  const totalQuantity = selectedTickets.reduce(
    (total, ticket) => total + (quantities[ticket.id] ?? 0),
    0,
  );

  const subtotal = selectedTickets.reduce(
    (total, ticket) =>
      total + Number(ticket.price) * (quantities[ticket.id] ?? 0),
    0,
  );

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const formattedDate = startDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedStartTime = startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEndTime = endDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  return (
    <main className="bg-white pt-16">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Event overview */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="min-h-70 overflow-hidden rounded-2xl bg-slate-100 lg:min-h-100">
            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="h-full min-h-70 w-full object-cover lg:min-h-100"
              />
            ) : (
              <div className="flex min-h-70 items-center justify-center text-slate-400 lg:min-h-100">
                No image available
              </div>
            )}
          </div>

          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
              {event.category.name}
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              {event.name}
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              {event.description}
            </p>

            <div className="mt-6 space-y-5 border-t border-slate-200 pt-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Date</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formattedDate}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Time</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formattedStartTime} - {formattedEndTime}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Location</p>
                <p className="mt-1 font-medium text-slate-900">
                  {event.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Available Seats
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {event.availableSeats} seats available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About event */}
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            About This Event
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            {event.description}
          </p>
        </section>

        {/* Ticket selection and order summary */}
        <section className="mt-16 border-t border-slate-200 pt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Choose Your Ticket
            </h2>
            <p className="mt-2 text-slate-600">
              Select your ticket and choose how many you need.
            </p>
          </div>

          {isTicketsLoading ? (
            <p className="py-8 text-slate-500">Loading tickets...</p>
          ) : isTicketsError ? (
            <p className="py-8 text-red-600">
              Failed to load tickets. Please try again later.
            </p>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium text-slate-800">
                No tickets available yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Ticket options have not been added to this event.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              {/* Ticket list */}
              <div className="min-w-0 space-y-4">
                {tickets.map((ticket) => {
                  const isSoldOut = ticket.availableQuantity <= 0;
                  const quantity = quantities[ticket.id] ?? 0;

                  return (
                    <article
                      key={ticket.id}
                      className={`rounded-xl border bg-white p-5 transition sm:p-6 ${
                        quantity > 0
                          ? "border-blue-300 ring-1 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {ticket.name}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                isSoldOut
                                  ? "bg-red-50 text-red-600"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {isSoldOut ? "Sold out" : "Available"}
                            </span>
                          </div>

                          <p className="mt-2 text-xl font-bold text-slate-900">
                            {formatPrice(ticket.price)}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {ticket.availableQuantity} tickets remaining
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:justify-end sm:border-0 sm:pt-0">
                          <span className="text-sm font-medium text-slate-600 sm:hidden">
                            Quantity
                          </span>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              aria-label={`Decrease ${ticket.name} quantity`}
                              disabled={quantity === 0}
                              onClick={() =>
                                updateQuantity(ticket.id, quantity - 1)
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>

                            <span
                              aria-live="polite"
                              className="w-6 text-center font-semibold text-slate-900"
                            >
                              {quantity}
                            </span>

                            <button
                              type="button"
                              aria-label={`Increase ${ticket.name} quantity`}
                              disabled={
                                isSoldOut ||
                                quantity >= ticket.availableQuantity
                              }
                              onClick={() =>
                                updateQuantity(ticket.id, quantity + 1)
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {quantity > 0 && (
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                          <span className="text-slate-500">
                            {formatPrice(ticket.price)} × {quantity}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatPrice(Number(ticket.price) * quantity)}
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Order summary */}
              <aside className="min-w-0 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7.5h12l1 13H5l1-13Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 8V6a3 3 0 0 1 6 0v2"
                        />
                      </svg>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Order Summary
                      </h3>
                      <p className="text-sm text-slate-500">
                        Review your selection
                      </p>
                    </div>
                  </div>

                  <div className="my-5 border-t border-slate-200" />

                  {selectedTickets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No tickets selected
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Choose a ticket and set the quantity to see your order
                        summary.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedTickets.map((ticket) => {
                        const quantity = quantities[ticket.id] ?? 0;
                        const lineTotal = Number(ticket.price) * quantity;

                        return (
                          <div
                            key={ticket.id}
                            className="flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="break-words text-sm font-medium text-slate-800">
                                {ticket.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatPrice(ticket.price)} × {quantity}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-slate-900">
                              {formatPrice(lineTotal)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="my-5 border-t border-slate-200" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600">
                      Total tickets
                    </span>
                    <span className="font-semibold text-slate-900">
                      {totalQuantity}{" "}
                      {totalQuantity === 1 ? "ticket" : "tickets"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-slate-600">
                      Estimated subtotal
                    </p>
                    <p className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900">
                      {formatPrice(subtotal)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={totalQuantity === 0}
                    onClick={() => {
                      // Checkout will be implemented in the next feature.
                    }}
                    className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Continue to Checkout
                  </button>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Your selection is temporary. Tickets are not reserved
                    until checkout is implemented.
                  </p>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  All prices are displayed in Indonesian Rupiah (IDR).
                </p>
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventDetailPage;
