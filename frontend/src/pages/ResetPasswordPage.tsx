import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/axios";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("Token reset password tidak ditemukan");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password harus memiliki huruf besar");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("Password harus memiliki huruf kecil");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error("Password harus memiliki angka");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      toast.error("Password harus memiliki karakter spesial");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak sama");
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });

      toast.success(response.data.message ?? "Password berhasil diubah");

      navigate("/login", { replace: true });
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        toast.error(
          axiosError.response?.data?.message ?? "Gagal mengatur ulang password",
        );
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Kembali ke login
        </Link>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <LockKeyhole size={28} />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Reset Password
        </h1>

        <p className="mb-8 text-sm leading-6 text-gray-600">
          Buat password baru untuk akun kamu. Gunakan minimal 8 karakter dengan
          huruf besar, huruf kecil, angka, dan karakter spesial.
        </p>

        {!token ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Token reset password tidak ditemukan. Silakan minta tautan reset
              password yang baru.
            </p>

            <Link
              to="/forgot-password"
              className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Minta Tautan Baru
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password Baru
              </label>

              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Konfirmasi Password Baru
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Menyimpan..." : "Ubah Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Ingat password kamu?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
