import { changePasswordSchema, type ChangePasswordSchema } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type ChangePasswordFormProps = {
  onSubmit: (values: ChangePasswordSchema) => void;
  onCancel: () => void;
  isPending: boolean;
};

function ChangePasswordForm({
  onSubmit,
  onCancel,
  isPending,
}: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Password Lama
        </label>

        <input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-500">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Password Baru
        </label>

        <input
          id="newPassword"
          type="password"
          {...register("newPassword")}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-500">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Konfirmasi Password Baru
        </label>

        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lanjutkan
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;
