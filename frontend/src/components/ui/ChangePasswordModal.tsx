import type { ChangePasswordSchema } from "@/schema/auth";
import ChangePasswordForm from "./ChangePasswordForm";

type ChangePasswordModalProps = {
  open: boolean;
  onSubmit: (values: ChangePasswordSchema) => void;
  onCancel: () => void;
  isPending: boolean;
};

function ChangePasswordModal({
  open,
  onSubmit,
  onCancel,
  isPending,
}: ChangePasswordModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Change Password</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Masukkan password lama dan password baru kamu.
          </p>
        </div>

        <ChangePasswordForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          isPending={isPending}
        />
      </div>
    </div>
  );
}

export default ChangePasswordModal;
