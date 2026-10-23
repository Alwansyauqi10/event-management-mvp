import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { toast } from "sonner";

import {
  checkInTransaction,
  getCheckInAttendees,
} from "@/services/checkIn.service";

export default function CheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();

  const attendeesQuery = useQuery({
    queryKey: ["check-in-attendees", eventId],
    queryFn: () => getCheckInAttendees(eventId!),
    enabled: Boolean(eventId && /^[1-9]\d*$/.test(eventId)),
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

  if (!eventId || !/^[1-9]\d*$/.test(eventId)) {
    return (
      <div className="p-6">
        <p className="text-red-600">ID event tidak valid.</p>
      </div>
    );
  }

  if (attendeesQuery.isPending) {
    return <div className="p-6">Memuat daftar peserta...</div>;
  }

  if (attendeesQuery.isError) {
    return (
      <div className="p-6">
        <p className="text-red-600">Gagal mengambil daftar peserta.</p>

        <button
          type="button"
          onClick={() => attendeesQuery.refetch()}
          className="mt-3 rounded-lg border px-4 py-2"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const result = attendeesQuery.data;
  const { event, data: attendees, meta } = result;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Check-in Peserta</h1>
        <p className="mt-1 text-gray-500">{event.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Total Transaksi</p>
          <p className="mt-1 text-2xl font-bold">{meta.totalTransactions}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Sudah Check-in</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {meta.checkedInCount}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Belum Check-in</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">
            {meta.notCheckedInCount}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <h2 className="font-semibold">Daftar Peserta</h2>

          <button
            type="button"
            onClick={() => attendeesQuery.refetch()}
            disabled={attendeesQuery.isFetching}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
          >
            {attendeesQuery.isFetching ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {attendees.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            Belum ada transaksi peserta yang memenuhi syarat check-in.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3">Detail Tiket</th>
                  <th className="px-4 py-3">Jumlah Tiket</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Waktu Check-in</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {attendees.map((attendee) => {
                  const isCheckedIn = attendee.status === "CHECKED_IN";

                  const isProcessing =
                    checkInMutation.isPending &&
                    checkInMutation.variables === attendee.transactionId;

                  return (
                    <tr key={attendee.transactionId}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-gray-500">{attendee.email}</p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {attendee.ticketDetails.map((ticket, index) => (
                            <p key={`${ticket.name}-${index}`}>
                              <span className="font-medium">{ticket.name}</span>
                              <span className="text-gray-500">
                                {" "}
                                × {ticket.quantity}
                              </span>
                            </p>
                          ))}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">{attendee.ticketQuantity}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            isCheckedIn
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {isCheckedIn ? "Sudah Check-in" : "Belum Check-in"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {attendee.checkedInAt
                          ? new Date(attendee.checkedInAt).toLocaleString(
                              "id-ID",
                            )
                          : "-"}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={isCheckedIn || checkInMutation.isPending}
                          onClick={() =>
                            checkInMutation.mutate(attendee.transactionId)
                          }
                          className="whitespace-nowrap rounded-lg bg-black px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
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
        )}
      </div>
    </div>
  );
}
