import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Search, Star, MessageSquare } from "lucide-react";
import OrganizerEventHeader from "@/components/profile/OrganizerEventHeader";

import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface EventReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}

interface EventReviewsData {
  event: {
    id: string;
    name: string;
    location?: string | null;
    start_date?: string | null;
    startDate?: string | null;
    category_id?: string | number | null;
    categoryId?: string | number | null;
    category?: { name?: string | null } | null;
  };
  averageRating: number;
  totalReviews: number;
  reviews: EventReview[];
}

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 400;

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

function RatingStars({
  rating,
  size = "text-lg",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div
      className={`flex items-center gap-0.5 ${size}`}
      aria-label={`Rating ${rating} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-amber-400" : "text-slate-200"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function OrganizerEventReviewsPage() {
  const { eventId } = useParams();

  const [data, setData] = useState<EventReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, eventId]);

  useEffect(() => {
    let active = true;

    const fetchReviews = async () => {
      if (!eventId) {
        setError("ID event tidak ditemukan.");
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/event-reviews/events/${eventId}`);

        const result = response.data.data ?? response.data;

        if (active) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!active) return;

        const message =
          typeof err === "object" && err !== null && "response" in err
            ? (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message
            : undefined;

        setError(message ?? "Gagal memuat review event.");
        setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchReviews();

    return () => {
      active = false;
    };
  }, [eventId]);

  const keyword = debouncedSearch.toLocaleLowerCase("id-ID");

  const filteredReviews = (data?.reviews ?? []).filter((review) => {
    if (!keyword) return true;

    return (
      (review.user?.name ?? "").toLocaleLowerCase("id-ID").includes(keyword) ||
      (review.comment ?? "").toLocaleLowerCase("id-ID").includes(keyword) ||
      String(review.rating).includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE);

  const paginatedReviews = filteredReviews.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 1,
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <p className="mt-4 text-sm text-slate-500">Memuat review...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-700">Review gagal dimuat</p>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : data ? (
          <>
            <OrganizerEventHeader
              title="Review & Rating"
              description="Lihat penilaian dan pengalaman peserta terhadap event kamu."
              event={data.event}
            />
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Rating Rata-rata</p>
                  <Star className="size-5 text-amber-400" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {Number(data.averageRating ?? 0).toFixed(1)}
                  </span>
                  <div>
                    <RatingStars
                      rating={Math.round(data.averageRating ?? 0)}
                      size="text-lg"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      dari 5 bintang
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Total Review</p>
                  <MessageSquare className="size-5 text-slate-400" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {data.totalReviews ?? data.reviews.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Review dari peserta event
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-4 sm:p-5">
                <h2 className="font-bold text-slate-900">Review Peserta</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredReviews.length} review ditemukan
                </p>
              </div>

              <div className="border-b border-slate-200 p-4 sm:p-5">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama peserta, komentar, rating..."
                    className="h-10 border-slate-200 pl-9"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Pencarian berdasarkan nama peserta, isi komentar, atau nilai
                  rating.
                </p>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <MessageSquare className="mx-auto size-10 text-slate-300" />
                  <h3 className="mt-3 font-semibold text-slate-900">
                    {data.reviews.length === 0
                      ? "Belum ada review"
                      : "Review tidak ditemukan"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    {data.reviews.length === 0
                      ? "Review peserta akan muncul setelah peserta mengirimkan rating."
                      : "Coba gunakan kata kunci pencarian yang berbeda."}
                  </p>
                  {data.reviews.length === 0 && (
                    <Link
                      to="/organizer/events"
                      className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Kembali ke Event Saya
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-slate-100">
                    {paginatedReviews.map((review) => (
                      <article
                        key={review.id}
                        className="p-4 transition hover:bg-slate-50/70 sm:p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700">
                            {(review.user?.name || "P").charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="font-semibold text-slate-900">
                                  {review.user?.name || "Peserta"}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <RatingStars rating={review.rating} />
                                <span className="text-sm font-semibold text-slate-700">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>

                            <div className="mt-4">
                              {review.comment ? (
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                  {review.comment}
                                </p>
                              ) : (
                                <p className="text-sm italic text-slate-400">
                                  Peserta memberikan rating tanpa komentar.
                                </p>
                              )}
                            </div>

                            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                              <span>✓</span>
                              Review peserta
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Menampilkan {(page - 1) * PAGE_SIZE + 1}–
                      {Math.min(page * PAGE_SIZE, filteredReviews.length)} dari{" "}
                      {filteredReviews.length} review
                    </p>

                    {totalPages > 1 && (
                      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                        <PaginationContent className="flex-wrap">
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage((current) => Math.max(1, current - 1));
                              }}
                              aria-disabled={page === 1}
                              className={
                                page === 1
                                  ? "pointer-events-none opacity-40"
                                  : ""
                              }
                            />
                          </PaginationItem>

                          {visiblePages.map((pageNumber, index) => {
                            const previousPage = visiblePages[index - 1];
                            const showEllipsis =
                              previousPage !== undefined &&
                              pageNumber - previousPage > 1;

                            return (
                              <PaginationItem key={pageNumber}>
                                {showEllipsis && (
                                  <span className="px-1 text-slate-400">
                                    ...
                                  </span>
                                )}
                                <PaginationLink
                                  href="#"
                                  isActive={pageNumber === page}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPage(pageNumber);
                                  }}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage((current) =>
                                  Math.min(totalPages, current + 1),
                                );
                              }}
                              aria-disabled={page === totalPages}
                              className={
                                page === totalPages
                                  ? "pointer-events-none opacity-40"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </div>
                </>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
