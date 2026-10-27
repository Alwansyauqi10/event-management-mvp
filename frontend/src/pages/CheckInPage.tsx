import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Search, Users, CheckCircle2, Clock } from "lucide-react";
import OrganizerEventHeader from "@/components/profile/OrganizerEventHeader";

import {
  checkInTransaction,
  getCheckInAttendees,
} from "@/services/checkIn.service";

import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 400;

export default function CheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();

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

  const validEventId = Boolean(eventId && /^[1-9]\d*$/.test(eventId));

  const attendeesQuery = useQuery({
    queryKey: ["check-in-attendees", eventId],
    queryFn: () => getCheckInAttendees(eventId!),
    enabled: validEventId,
  });

  const checkInMutation = useMutation({
    mutationFn: (transactionId: string) => checkInTransaction(transactionId),

    onSuccess: async () => {
      toast.success("Peserta berhasil di-check-in");

      await queryClient.invalidateQueries({
        queryKey: ["check-in-attendees", eventId],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal melakukan check-in");
    },
  });

  const attendees = attendeesQuery.data?.data ?? [];

  const keyword = debouncedSearch.toLocaleLowerCase("id-ID");

  const filteredAttendees = attendees.filter((attendee) => {
    if (!keyword) return true;

    return (
      attendee.name.toLocaleLowerCase("id-ID").includes(keyword) ||
      attendee.email.toLocaleLowerCase("id-ID").includes(keyword) ||
      attendee.transactionId.toLocaleLowerCase("id-ID").includes(keyword) ||
      attendee.ticketDetails.some((ticket) =>
        ticket.name.toLocaleLowerCase("id-ID").includes(keyword),
      )
    );
  });

  const totalPages = Math.ceil(filteredAttendees.length / PAGE_SIZE);

  const paginatedAttendees = filteredAttendees.slice(
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

  if (!validEventId) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <p className="text-sm text-red-600">ID event tidak valid.</p>
        </div>
      </main>
    );
  }

  if (attendeesQuery.isPending) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm text-slate-500">
            Memuat daftar peserta...
          </p>
        </div>
      </main>
    );
  }

  if (attendeesQuery.isError || !attendeesQuery.data) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="font-semibold text-red-600">
            Gagal mengambil daftar peserta.
          </p>
          <button
            type="button"
            onClick={() => attendeesQuery.refetch()}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  const { event, meta } = attendeesQuery.data;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <OrganizerEventHeader
          title="Check-in Peserta"
          description="Kelola kehadiran peserta event dengan mudah."
          event={event}
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total Transaksi</p>
              <Users className="size-5 text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {meta.totalTransactions}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Sudah Check-in</p>
              <CheckCircle2 className="size-5 text-green-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-green-600">
              {meta.checkedInCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Belum Check-in</p>
              <Clock className="size-5 text-orange-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-orange-600">
              {meta.notCheckedInCount}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Daftar Peserta</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredAttendees.length} peserta ditemukan
              </p>
            </div>

            <button
              type="button"
              onClick={() => attendeesQuery.refetch()}
              disabled={attendeesQuery.isFetching}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {attendeesQuery.isFetching ? "Memuat..." : "Refresh"}
            </button>
          </div>

          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email, transaksi, tiket..."
                className="h-10 border-slate-200 pl-9"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Pencarian berdasarkan nama peserta, email, ID transaksi, atau nama
              tiket.
            </p>
          </div>

          {filteredAttendees.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <Users className="mx-auto size-10 text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-900">
                {attendees.length === 0
                  ? "Belum ada peserta"
                  : "Peserta tidak ditemukan"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {attendees.length === 0
                  ? "Belum ada transaksi peserta yang memenuhi syarat check-in."
                  : "Coba gunakan kata kunci pencarian yang berbeda."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Peserta</th>
                      <th className="px-4 py-3 font-medium">Detail Tiket</th>
                      <th className="px-4 py-3 font-medium">Jumlah</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Waktu Check-in</th>
                      <th className="px-4 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedAttendees.map((attendee) => {
                      const isCheckedIn = attendee.status === "CHECKED_IN";

                      const isProcessing =
                        checkInMutation.isPending &&
                        checkInMutation.variables === attendee.transactionId;

                      return (
                        <tr
                          key={attendee.transactionId}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {attendee.name}
                            </p>
                            <p className="mt-1 text-slate-500">
                              {attendee.email}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {attendee.ticketDetails.map((ticket, index) => (
                                <p key={`${ticket.name}-${index}`}>
                                  <span className="font-medium text-slate-700">
                                    {ticket.name}
                                  </span>
                                  <span className="text-slate-500">
                                    {" "}
                                    × {ticket.quantity}
                                  </span>
                                </p>
                              ))}
                            </div>
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-700">
                            {attendee.ticketQuantity}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                                isCheckedIn
                                  ? "bg-green-50 text-green-700"
                                  : "bg-orange-50 text-orange-700"
                              }`}
                            >
                              {isCheckedIn
                                ? "Sudah Check-in"
                                : "Belum Check-in"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-slate-500">
                            {attendee.checkedInAt
                              ? new Date(attendee.checkedInAt).toLocaleString(
                                  "id-ID",
                                )
                              : "-"}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              disabled={
                                isCheckedIn || checkInMutation.isPending
                              }
                              onClick={() =>
                                checkInMutation.mutate(attendee.transactionId)
                              }
                              className="whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isCheckedIn
                                ? "Selesai"
                                : isProcessing
                                  ? "Memproses..."
                                  : "Check-in"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Menampilkan {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filteredAttendees.length)} dari{" "}
                  {filteredAttendees.length} peserta
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
                            page === 1 ? "pointer-events-none opacity-40" : ""
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
                              <span className="px-1 text-slate-400">...</span>
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
      </div>
    </main>
  );
}
