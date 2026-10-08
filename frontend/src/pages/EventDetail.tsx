import { useParams } from "react-router";
import { useEventById } from "@/hooks/useEvent";

function EventDetailPage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useEventById(id ?? "");

  if (isLoading) {
    return <div>Loading event...</div>;
  }

  if (isError) {
    return <div>Failed to load event.</div>;
  }

  if (!data?.data) {
    return <div>Event not found.</div>;
  }

  const event = data.data;
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

  return (
    <main className="bg-white pt-16">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Event Header */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Event Image */}
          <div className="h-full min-h-70 lg:min-h-100 overflow-hidden rounded-2xl bg-slate-100">
            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                No image available
              </div>
            )}
          </div>

          {/* Event Information */}
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
              {event.category.name}
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              {event.name}
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {event.description}
            </p>

            <div className="mt-8 space-y-4 border-t border-slate-200 pt-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Date</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {formattedDate}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Time</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {formattedStartTime} - {formattedEndTime}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">Location</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {event.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Available Seats
                </p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {event.availableSeats} seats available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About This Event */}
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            About This Event
          </h2>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {event.description}
          </p>
        </section>
      </div>
    </main>
  );
}

export default EventDetailPage;
