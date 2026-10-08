import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { loginSchema, type LoginSchema } from "@/schema/auth";
import { useLogin } from "@/hooks/useAuth";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useLogin();

  const handleLogin = (values: LoginSchema) => {
    mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
              🔐
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Selamat Datang
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Login ke akun kamu untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                {...register("email")}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Masukkan password"
                {...register("password")}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Sedang login..." : "Login"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 Your App. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
