
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { toast } from "sonner";
import {
  TicketPercent,
  Plus,
  RefreshCw,
  CalendarDays,
  Tag,
  Hash,
  Percent,
  Wallet,
  Ban,
  Pencil,
  X,
} from "lucide-react";

import OrganizerEventHeader from "@/components/profile/OrganizerEventHeader";
import { getCheckInAttendees } from "@/services/checkIn.service";
import {
  createVoucher,
  updateVoucher,
  deactivateVoucher,
  getEventVouchers,
  type CreateVoucherInput,
  type UpdateVoucherInput,
  type Voucher,
  type VoucherDiscountType,
} from "@/services/voucher.service";

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

const formatDate = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const toLocalDateTime = (value: string | Date) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const initialForm = () => {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 86400000);

  return {
    code: "",
    discountType: "PERCENTAGE" as VoucherDiscountType,
    discountValue: "10",
    maxDiscount: "",
    quota: "100",
    startAt: toLocalDateTime(now),
    endAt: toLocalDateTime(end),
  };
};

type VoucherForm = ReturnType<typeof initialForm>;

const formFromVoucher = (voucher: Voucher): VoucherForm => ({
  code: voucher.code,
  discountType: voucher.discountType,
  discountValue: String(voucher.discountValue),
  maxDiscount:
    voucher.maxDiscount == null ? "" : String(voucher.maxDiscount),
  quota: String(voucher.quota),
  startAt: toLocalDateTime(voucher.startAt),
  endAt: toLocalDateTime(voucher.endAt),
});

export default function OrganizerVouchersPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>(initialForm);

  const validEventId = Boolean(eventId && /^[1-9]\d*$/.test(eventId));

  const eventQuery = useQuery({
    queryKey: ["check-in-attendees", eventId],
    queryFn: () => getCheckInAttendees(eventId!),
    enabled: validEventId,
  });

  const vouchersQuery = useQuery({
    queryKey: ["event-vouchers", eventId],
    queryFn: () => getEventVouchers(eventId!),
    enabled: validEventId,
  });

  const refreshVouchers = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["event-vouchers", eventId],
    });
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateVoucherInput) => createVoucher(input),
    onSuccess: async () => {
      toast.success("Voucher berhasil dibuat");
      closeForm();
      await refreshVouchers();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal membuat voucher");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      voucherId,
      input,
    }: {
      voucherId: string;
      input: UpdateVoucherInput;
    }) => updateVoucher(voucherId, input),
    onSuccess: async () => {
      toast.success("Voucher berhasil diperbarui");
      closeForm();
      await refreshVouchers();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Gagal memperbarui voucher");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (voucherId: string) => deactivateVoucher(voucherId),
    onSuccess: refreshVouchers,
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Gagal menonaktifkan voucher",
      );
    },
  });

  const vouchers = vouchersQuery.data ?? [];
  const activeVouchers = vouchers.filter((voucher) => !voucher.deletedAt);
  const totalQuota = activeVouchers.reduce((sum, voucher) => sum + voucher.quota, 0);
  const totalUsed = activeVouchers.reduce(
    (sum, voucher) => sum + voucher.usedQuantity,
    0,
  );

  const updateForm = (field: keyof VoucherForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  function closeForm() {
    setShowForm(false);
    setEditingVoucher(null);
    setForm(initialForm());
  }

  const startCreate = () => {
    setEditingVoucher(null);
    setForm(initialForm());
    setShowForm(true);
  };

  const startEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setForm(formFromVoucher(voucher));
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!eventId || !validEventId) {
      toast.error("ID event tidak valid");
      return;
    }

    const discountValue = Number(form.discountValue);
    const quota = Number(form.quota);
    const maxDiscount =
      form.discountType === "PERCENTAGE" && form.maxDiscount.trim()
        ? Number(form.maxDiscount)
        : undefined;

    if (!form.code.trim()) {
      toast.error("Kode voucher wajib diisi");
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error("Nilai diskon harus lebih dari 0");
      return;
    }

    if (form.discountType === "PERCENTAGE" && discountValue > 100) {
      toast.error("Diskon persentase maksimal 100%");
      return;
    }

    if (!Number.isInteger(quota) || quota < 1) {
      toast.error("Kuota voucher minimal 1");
      return;
    }

    if (maxDiscount !== undefined && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) {
      toast.error("Maksimal diskon harus lebih dari 0");
      return;
    }

    if (
      editingVoucher &&
      editingVoucher.usedQuantity > 0 &&
      quota < editingVoucher.usedQuantity
    ) {
      toast.error("Kuota tidak boleh di bawah jumlah voucher yang sudah digunakan");
      return;
    }

    const startAt = new Date(form.startAt);
    const endAt = new Date(form.endAt);

    if (
      !form.startAt ||
      !form.endAt ||
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      toast.error("Tanggal berakhir harus setelah tanggal mulai");
      return;
    }

    const payload: UpdateVoucherInput = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue,
      ...(maxDiscount !== undefined ? { maxDiscount } : {}),
      quota,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };

    if (editingVoucher) {
      updateMutation.mutate({
        voucherId: editingVoucher.id,
        input: payload,
      });
    } else {
      createMutation.mutate({
        eventId,
        ...payload,
      });
    }
  };

  const getVoucherStatus = (voucher: Voucher) => {
    const now = Date.now();

    if (voucher.deletedAt) {
      return { label: "Nonaktif", className: "bg-slate-100 text-slate-600" };
    }
    if (new Date(voucher.endAt).getTime() < now) {
      return { label: "Kedaluwarsa", className: "bg-rose-50 text-rose-700" };
    }
    if (new Date(voucher.startAt).getTime() > now) {
      return { label: "Terjadwal", className: "bg-blue-50 text-blue-700" };
    }
    if (voucher.usedQuantity >= voucher.quota) {
      return { label: "Kuota Habis", className: "bg-orange-50 text-orange-700" };
    }
    return { label: "Aktif", className: "bg-emerald-50 text-emerald-700" };
  };

  if (!validEventId) {
    return <main className="p-8 text-red-600">ID event tidak valid.</main>;
  }

  if (eventQuery.isPending || vouchersQuery.isPending) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="rounded-xl border bg-white p-12 text-center">
          Memuat data event dan voucher...
        </div>
      </main>
    );
  }

  if (
    eventQuery.isError ||
    !eventQuery.data ||
    vouchersQuery.isError ||
    !vouchersQuery.data
  ) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="font-semibold text-red-600">
            Gagal mengambil data event atau voucher.
          </p>
          <button
            type="button"
            onClick={() => {
              void eventQuery.refetch();
              void vouchersQuery.refetch();
            }}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white"
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  const { event } = eventQuery.data;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isUsedVoucher = Boolean(editingVoucher && editingVoucher.usedQuantity > 0);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <OrganizerEventHeader
          title="Kelola Voucher"
          description="Buat dan kelola kode promo untuk event kamu."
          event={event}
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Voucher Aktif", value: activeVouchers.length, icon: TicketPercent },
            { label: "Total Kuota", value: totalQuota, icon: Hash },
            { label: "Voucher Terpakai", value: totalUsed, icon: Tag },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{label}</p>
                <Icon className="size-5 text-violet-500" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-bold text-slate-900">Daftar Voucher</h2>
              <p className="mt-1 text-sm text-slate-500">
                {vouchers.length} voucher terdaftar untuk event ini.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void vouchersQuery.refetch()}
                disabled={vouchersQuery.isFetching}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={16} className={vouchersQuery.isFetching ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                type="button"
                onClick={showForm ? closeForm : startCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                {showForm ? <X size={17} /> : <Plus size={17} />}
                {showForm ? "Tutup Form" : "Buat Voucher"}
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-5 border-b bg-slate-50/70 p-4 sm:p-6">
              <div>
                <h3 className="font-bold text-slate-900">
                  {editingVoucher ? `Edit Voucher ${editingVoucher.code}` : "Buat Voucher Baru"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {isUsedVoucher
                    ? "Voucher sudah digunakan. Hanya kuota yang boleh dinaikkan."
                    : "Lengkapi kode, diskon, kuota, dan periode promo."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="voucher-code" className="mb-1.5 block text-sm font-medium">
                    Kode Voucher
                  </label>
                  <input
                    id="voucher-code"
                    value={form.code}
                    onChange={(e) => updateForm("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
                    disabled={isUsedVoucher}
                    maxLength={30}
                    required
                    placeholder="Contoh: HEMAT20"
                    className="h-11 w-full rounded-lg border bg-white px-3 text-sm disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="discount-type" className="mb-1.5 block text-sm font-medium">
                    Tipe Diskon
                  </label>
                  <select
                    id="discount-type"
                    value={form.discountType}
                    disabled={isUsedVoucher}
                    onChange={(e) => updateForm("discountType", e.target.value as VoucherDiscountType)}
                    className="h-11 w-full rounded-lg border bg-white px-3 text-sm disabled:bg-slate-100"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED">Nominal tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="discount-value" className="mb-1.5 block text-sm font-medium">
                    Nilai Diskon
                  </label>
                  <div className="relative">
                    {form.discountType === "PERCENTAGE" ? (
                      <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    ) : (
                      <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                    <input
                      id="discount-value"
                      type="number"
                      min="1"
                      max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                      step="any"
                      value={form.discountValue}
                      disabled={isUsedVoucher}
                      onChange={(e) => updateForm("discountValue", e.target.value)}
                      required
                      className="h-11 w-full rounded-lg border bg-white pl-9 pr-3 text-sm disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {form.discountType === "PERCENTAGE" && (
                  <div>
                    <label htmlFor="max-discount" className="mb-1.5 block text-sm font-medium">
                      Maksimal Diskon (Rp), opsional
                    </label>
                    <input
                      id="max-discount"
                      type="number"
                      min="1"
                      value={form.maxDiscount}
                      disabled={isUsedVoucher}
                      onChange={(e) => updateForm("maxDiscount", e.target.value)}
                      placeholder="Contoh: 50000"
                      className="h-11 w-full rounded-lg border bg-white px-3 text-sm disabled:bg-slate-100"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="voucher-quota" className="mb-1.5 block text-sm font-medium">
                    Kuota Voucher
                  </label>
                  <input
                    id="voucher-quota"
                    type="number"
                    min={editingVoucher?.usedQuantity || 1}
                    step="1"
                    value={form.quota}
                    onChange={(e) => updateForm("quota", e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="voucher-start" className="mb-1.5 block text-sm font-medium">
                    Mulai Berlaku
                  </label>
                  <input
                    id="voucher-start"
                    type="datetime-local"
                    value={form.startAt}
                    disabled={isUsedVoucher}
                    onChange={(e) => updateForm("startAt", e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border bg-white px-3 text-sm disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label htmlFor="voucher-end" className="mb-1.5 block text-sm font-medium">
                    Berakhir
                  </label>
                  <input
                    id="voucher-end"
                    type="datetime-local"
                    min={form.startAt}
                    value={form.endAt}
                    disabled={isUsedVoucher}
                    onChange={(e) => updateForm("endAt", e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border bg-white px-3 text-sm disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeForm} className="rounded-lg border bg-white px-4 py-2.5 text-sm">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || updateMutation.isPending}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : editingVoucher ? "Simpan Perubahan" : "Simpan Voucher"}
                </button>
              </div>
            </form>
          )}

          {vouchers.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <TicketPercent className="mx-auto size-10 text-slate-300" />
              <h3 className="mt-3 font-semibold">Belum ada voucher</h3>
              <p className="mt-2 text-sm text-slate-500">
                Buat voucher pertama untuk memberikan promo kepada peserta.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Kode Voucher</th>
                    <th className="px-5 py-3 font-medium">Diskon</th>
                    <th className="px-5 py-3 font-medium">Pemakaian</th>
                    <th className="px-5 py-3 font-medium">Periode</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vouchers.map((voucher) => {
                    const status = getVoucherStatus(voucher);
                    const canDeactivate =
                      !voucher.deletedAt &&
                      new Date(voucher.endAt).getTime() >= Date.now() &&
                      voucher.usedQuantity < voucher.quota;

                    return (
                      <tr key={voucher.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{voucher.code}</p>
                          <p className="mt-1 text-xs text-slate-500">ID: {voucher.id}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {voucher.discountType === "PERCENTAGE"
                              ? `${Number(voucher.discountValue)}%`
                              : formatCurrency(voucher.discountValue)}
                          </p>
                          {voucher.maxDiscount != null && (
                            <p className="mt-1 text-xs text-slate-500">
                              Maks. {formatCurrency(voucher.maxDiscount)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p>{voucher.usedQuantity} / {voucher.quota}</p>
                          <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-violet-500"
                              style={{
                                width: `${Math.min(100, (voucher.usedQuantity / Math.max(1, voucher.quota)) * 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400" />
                            <div className="space-y-1 text-xs text-slate-600">
                              <p>{formatDate(voucher.startAt)}</p>
                              <p>s/d {formatDate(voucher.endAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {!voucher.deletedAt && (
                              <button
                                type="button"
                                onClick={() => startEdit(voucher)}
                                title="Edit Voucher"
                                aria-label={`Edit voucher ${voucher.code}`}
                                className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Pencil size={16} />
                              </button>
                            )}
                            {canDeactivate && (
                              <button
                                type="button"
                                disabled={deactivateMutation.isPending}
                                onClick={() => {
                                  if (window.confirm(`Nonaktifkan voucher ${voucher.code}?`)) {
                                    deactivateMutation.mutate(voucher.id);
                                  }
                                }}
                                title="Nonaktifkan Voucher"
                                aria-label={`Nonaktifkan voucher ${voucher.code}`}
                                className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
