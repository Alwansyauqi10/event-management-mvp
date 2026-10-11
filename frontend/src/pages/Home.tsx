import { useQuery } from "@tanstack/react-query";
import {
  getEvents,
  getEventLocations,
  type EventsResponse,
} from "../services/event.service";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const categories = ["Music", "Workshop", "Sports", "Community", "Business"];

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Find events that match your interests, location, and the experiences you are looking for.",
  },
  {
    number: "02",
    title: "Book",
    description:
      "Choose your tickets and complete your booking quickly and securely with HAYA.",
  },
  {
    number: "03",
    title: "Experience",
    description:
      "Show up, enjoy the moment, & create memorable experiences with the people around you.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const { data, isLoading, isError } = useQuery<EventsResponse>({
    queryKey: ["events", debouncedSearch, location, category, page],
    queryFn: () =>
      getEvents({
        search: debouncedSearch,
        location,
        category,
        page,
        limit: 8,
      }),
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, location, category]);

  const { data: locationsData } = useQuery({
    queryKey: ["event-locations"],
    queryFn: getEventLocations,
  });
  const events = data?.data ?? [];
  const locations = locationsData?.data ?? [];

  const totalPages = data?.meta.totalPages ?? 1;

  const formatEventDate = (date: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <>
      {/* Section 1 */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/Hero%20Image%20Home.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-white via-white/85 to-white/10" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pt-18">
          <div className="w-full max-w-4xl">
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
              Discover. Book. Experience.
            </p>

            <h1 className="mt-5 max-w-2xl font-sora text-5xl font-bold leading-[1.05] tracking-tight text-haya-navy md:text-6xl lg:text-7xl">
              Your Next
              <span className="block text-haya-blue">Experience</span>
              Starts Here.
            </h1>

            <p className="mt-6 max-w-xl font-manrope text-base leading-7 text-haya-muted md:text-md">
              Find events, experiences, and moments worth remembering.
              <br />
              From music festivals to workshops, all in one place.
            </p>

            <div className="mt-8 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-xl shadow-haya-navy/10 md:flex-row">
              <div className="flex flex-1 items-center gap-3 px-4">
                <svg
                  className="h-5 w-5 shrink-0 text-haya-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>

                <Input
                  // className="w-full border-none bg-transparent outline-none focus:outline-none"
                  className="w-full border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-none"
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="hidden items-center border-l border-haya-border px-5 md:flex">
                <svg
                  className="mr-2 h-5 w-5 text-haya-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
                  />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-32 cursor-pointer border-none bg-transparent text-sm text-haya-text outline-none"
                >
                  <option value="">All Locations</option>

                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="mt-2 rounded-xl bg-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-haya-blue-light md:mt-0"
              >
                Search
              </button>
            </div>

            <div className="mt-6 flex max-w-4xl flex-wrap items-center gap-2">
              <span className="mr-1 font-manrope text-sm font-semibold text-haya-text">
                Popular:
              </span>

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full border px-5 py-2 font-manrope text-sm transition ${
                    category === item
                      ? "border-haya-blue bg-haya-blue text-white"
                      : "border-haya-border bg-white/80 text-haya-text hover:border-haya-blue hover:text-haya-blue"
                  }`}
                >
                  {item}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCategory("")}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 font-manrope text-sm transition ${
                  category === ""
                    ? "border-haya-blue bg-haya-blue text-white"
                    : "border-haya-blue bg-white text-haya-blue hover:bg-haya-blue hover:text-white"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="4" width="6" height="6" rx="1" />
                  <rect x="14" y="4" width="6" height="6" rx="1" />
                  <rect x="4" y="14" width="6" height="6" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>
                All Categories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="flex items-end justify-between">
            <div>
              <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
                Popular Events
              </p>

              <h2 className="mt-2 font-sora text-3xl font-bold tracking-tight text-haya-navy md:text-4xl">
                Events You Might Like
              </h2>
            </div>

            <a
              href="/events"
              className="hidden items-center gap-2 font-manrope text-sm font-semibold text-haya-blue transition hover:text-haya-blue-light sm:flex"
            >
              See All Events
              <span className="text-lg">→</span>
            </a>
          </div>

          {isLoading && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-xl border border-haya-border bg-haya-background"
                />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-manrope text-sm text-red-600">
              Failed to load events.
            </div>
          )}

          {!isLoading && !isError && events.length === 0 && (
            <div className="mt-8 rounded-xl border border-haya-border bg-haya-background px-6 py-12 text-center">
              <h3 className="font-sora text-lg font-semibold text-haya-navy">
                No events available
              </h3>

              <p className="mt-2 font-manrope text-sm text-haya-muted">
                There are no published events available right now.
              </p>
            </div>
          )}

          {/* Section 2 */}
          {!isLoading && !isError && events.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((event) => (
                <article
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
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

                    <button
                      type="button"
                      aria-label={`Save ${event.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-haya-navy shadow-sm backdrop-blur transition hover:bg-white"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                        />
                      </svg>
                    </button>
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
                          strokeWidth="1.8"
                        />
                        <path
                          d="M16 2v4M8 2v4M3 10h18"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>

                      <span>{formatEventDate(event.startDate)}</span>
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

          <div className="mt-8 sm:hidden">
            <a
              href="/events"
              className="font-manrope text-sm font-semibold text-haya-blue"
            >
              See All Events →
            </a>
          </div>

          {!isLoading && !isError && totalPages > 1 && (
            <Pagination className="mt-20">
              <PaginationContent className="gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();

                      if (page > 1) {
                        setPage(page - 1);
                      }
                    }}
                    className={`rounded-full border border-haya-border bg-white font-manrope text-sm font-medium text-haya-text transition hover:border-haya-blue hover:bg-haya-blue-soft hover:text-haya-blue ${
                      page === 1 ? "pointer-events-none opacity-40" : ""
                    }`}
                  />
                </PaginationItem>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNumber);
                      }}
                      className={`h-10 w-10 rounded-full font-manrope text-sm font-semibold transition ${
                        page === pageNumber
                          ? "border-haya-blue bg-haya-blue text-white shadow-md shadow-haya-blue/20 hover:bg-haya-blue-light hover:text-white"
                          : "border-haya-border bg-white text-haya-text hover:border-haya-blue hover:bg-haya-blue-soft hover:text-haya-blue"
                      }`}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();

                      if (page < totalPages) {
                        setPage(page + 1);
                      }
                    }}
                    className={`rounded-full border border-haya-border bg-white font-manrope text-sm font-medium text-haya-text transition hover:border-haya-blue hover:bg-haya-blue-soft hover:text-haya-blue ${
                      page === totalPages
                        ? "pointer-events-none opacity-40"
                        : ""
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      {/* Section 3 */}
      <section className="bg-haya-blue-soft py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
              How HAYA Works
            </p>

            <h2 className="mt-3 font-sora text-3xl font-bold tracking-tight text-haya-navy md:text-4xl">
              Discover. Book. Experience.
            </h2>

            <p className="mt-4 font-manrope text-base leading-7 text-haya-muted">
              Everything you need to find the right event and turn it into a
              memorable experience.
            </p>
          </div>

          <div className="relative mt-12 grid gap-8 md:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-7 hidden h-px bg-haya-blue/20 md:block" />

            {steps.map((step) => (
              <div key={step.number} className="relative z-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-haya-blue font-sora text-sm font-bold text-white shadow-lg shadow-haya-blue/20">
                  {step.number}
                </div>

                <h3 className="mt-5 font-sora text-xl font-bold text-haya-navy">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-xs font-manrope text-sm leading-6 text-haya-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
