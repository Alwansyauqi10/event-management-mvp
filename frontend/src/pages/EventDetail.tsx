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
    return <div className="px-6 py-16 text-center">Loading event...</div>;
  }

  if (isError) {
    return <div className="px-6 py-16 text-center">Failed to load event.</div>;
  }

  if (!data?.data) {
    return <div className="px-6 py-16 text-center">Event not found.</div>;
  }

  const event = data.data;
  const tickets = ticketsData?.data ?? [];
  const totalQuantity = tickets.reduce(
    (total, ticket) => total + (quantities[ticket.id] ?? 0),
    0,
  );

  const subtotal = tickets.reduce(
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

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  return (
    <main className="bg-white pt-16">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
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

            <div className="mt-4 space-y-4 border-t border-slate-200 pt-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Date</p>
                <p className="font-medium text-slate-900">{formattedDate}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Time</p>
                <p className="font-medium text-slate-900">
                  {formattedStartTime} - {formattedEndTime}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Location</p>
                <p className="font-medium text-slate-900">{event.location}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Available Seats
                </p>
                <p className="font-medium text-slate-900">
                  {event.availableSeats} seats available
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            About This Event
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            {event.description}
          </p>
        </section>

        <section className="mt-16 border-t border-slate-200 pt-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Choose Your Ticket
            </h2>
            <p className="mt-2 text-slate-600">
              Select your ticket and choose how many you need.
            </p>
          </div>

          {isTicketsLoading ? (
            <p className="mt-6 text-slate-500">Loading tickets...</p>
          ) : isTicketsError ? (
            <p className="mt-6 text-red-600">
              Failed to load tickets. Please try again later.
            </p>
          ) : tickets.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium text-slate-800">
                No tickets available yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Ticket options have not been added to this event.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {tickets.map((ticket) => {
                  const isSoldOut = ticket.availableQuantity <= 0;
                  const quantity = quantities[ticket.id] ?? 0;

                  return (
                    <article
                      key={ticket.id}
                      className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {ticket.name}
                          </h3>
                          <p className="mt-2 text-xl font-bold text-slate-900">
                            {formatPrice(ticket.price)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            isSoldOut
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {isSoldOut ? "Sold out" : "Available"}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-slate-500">
                        {ticket.availableQuantity} tickets remaining
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm font-medium text-slate-700">
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="w-6 text-center font-semibold">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${ticket.name} quantity`}
                            disabled={
                              isSoldOut || quantity >= ticket.availableQuantity
                            }
                            onClick={() =>
                              updateQuantity(ticket.id, quantity + 1)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">Total selected</span>
                  <span className="font-semibold text-slate-900">
                    {totalQuantity} tickets
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    Estimated subtotal
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatPrice(String(subtotal))}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={totalQuantity === 0}
                  onClick={() => {
                    // Checkout will be implemented in the next feature.
                  }}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Continue to Checkout
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  Your selection is temporary. Tickets are not reserved until
                  checkout is implemented.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventDetailPage;
