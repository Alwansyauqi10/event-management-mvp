import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import {
  getOrganizerPublicEvents,
  getOrganizerPublicProfile,
} from "../services/organizerProfile.service";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatRating = (rating: number | null) =>
  rating === null ? "Belum ada rating" : rating.toFixed(1);

function OrganizerProfilePage() {
  const { id = "" } = useParams();

  const {
    data: organizer,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["organizer-public-profile", id],
    queryFn: () => getOrganizerPublicProfile(id),
    enabled: /^\d+$/.test(id),
  });

  const {
    data: events,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useQuery({
    queryKey: ["organizer-public-events", id],
    queryFn: () => getOrganizerPublicEvents(id),
    enabled: /^\d+$/.test(id),
  });

  if (!/^\d+$/.test(id)) {
    return (
      <main className="px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Organizer tidak ditemukan
        </h1>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-700 hover:underline"
        >
          Kembali ke halaman utama
        </Link>
      </main>
    );
  }

  if (isProfileLoading) {
    return (
      <main className="px-6 py-20 text-center text-slate-500">
        Memuat profil organizer...
      </main>
    );
  }

  if (isProfileError || !organizer) {
    return (
      <main className="px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Profil organizer tidak tersedia
        </h1>
        <p className="mt-2 text-slate-500">
          Organizer mungkin tidak ditemukan atau terjadi masalah koneksi.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-700 hover:underline"
        >
          Kembali ke halaman utama
        </Link>
      </main>
    );
  }

  const stats = [
    {
      label: "Total event",
      value: statsValue(organizer.stats.totalPublishedEvents),
    },
    {
      label: "Event selesai",
      value: statsValue(organizer.stats.completedEvents),
    },
    {
      label: "Event mendatang",
      value: statsValue(organizer.stats.upcomingEvents),
    },
    {
      label: "Rating",
      value: formatRating(organizer.stats.averageRating),
      detail: `${organizer.stats.totalReviews} ulasan`,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Organizer header */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {organizer.profilePicture ? (
              <img
                src={organizer.profilePicture}
                alt={organizer.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-blue-50 text-3xl font-bold text-blue-700 ring-4 ring-slate-100">
                {organizer.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-blue-700">
                Event Organizer
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {organizer.name}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Bergabung sejak {formatDate(organizer.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* Organizer statistics */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">
            Statistik Organizer
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
                {"detail" in stat && (
                  <p className="mt-1 text-sm text-slate-500">{stat.detail}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Organizer events */}

        {/* Organizer events */}
        <section className="mt-12">
          <div>
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
              Organizer Events
            </p>

            <h2 className="mt-2 font-sora text-3xl font-bold tracking-tight text-haya-navy md:text-4xl">
              Event dari {organizer.name}
            </h2>

            <p className="mt-3 font-manrope text-base text-haya-muted">
              Temukan event lainnya yang diselenggarakan organizer ini.
            </p>
          </div>

          {isEventsLoading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-xl border border-haya-border bg-haya-background"
                />
              ))}
            </div>
          ) : isEventsError ? (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-manrope text-sm text-red-600">
              Failed to load events.
            </div>
          ) : !events?.length ? (
            <div className="mt-8 rounded-xl border border-haya-border bg-haya-background px-6 py-12 text-center">
              <h3 className="font-sora text-lg font-semibold text-haya-navy">
                No events available
              </h3>
              <p className="mt-2 font-manrope text-sm text-haya-muted">
                There are no published events available right now.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((event) => (
                <article
                  key={event.id}
                  onClick={() => {
                    window.location.href = `/events/${event.id}`;
                  }}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-haya-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image || "/Hero%20Image%20Home.png"}
                      alt={event.name}
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 font-manrope text-xs font-bold text-haya-blue shadow-sm">
                      {event.category.name}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-sora text-base font-semibold leading-6 text-haya-navy">
                      {event.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 font-manrope text-sm text-haya-muted">
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          strokeWidth={1.8}
                        />
                        <path
                          d="M16 2v4M8 2v4M3 10h18"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(event.startDate))}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 font-manrope text-sm text-haya-muted">
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
                        />
                        <circle cx="12" cy="11" r="2.5" />
                      </svg>
                      <span>{event.location}</span>
                    </div>

                    <div className="mt-4 font-manrope text-sm font-bold text-haya-text">
                      {event.availableSeats} seats available
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function statsValue(value: number) {
  return value.toLocaleString("id-ID");
}

export default OrganizerProfilePage;
