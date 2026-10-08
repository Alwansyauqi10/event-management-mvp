type ConfirmLogoutProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmLogout({ open, onCancel, onConfirm }: ConfirmLogoutProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">Konfirmasi Logout</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Yakin ingin keluar dari akun kamu?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmLogout;
