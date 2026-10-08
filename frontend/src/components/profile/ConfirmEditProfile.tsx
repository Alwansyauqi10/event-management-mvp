type ConfirmEditProfileProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
};

function ConfirmEditProfile({
  open,
  onCancel,
  onConfirm,
  isPending,
}: ConfirmEditProfileProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">
          Konfirmasi Perubahan
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Yakin ingin menyimpan perubahan profile kamu?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Menyimpan..." : "Ya, Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEditProfile;
