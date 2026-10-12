import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email wajib diisi");
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      toast.success(
        response.data.message ??
          "Jika email terdaftar, instruksi reset password akan dikirim.",
      );

      setEmail("");
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
          axiosError.response?.data?.message ??
            "Gagal mengirim permintaan reset password",
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
          <Mail size={28} />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Lupa Password?
        </h1>

        <p className="mb-8 text-sm leading-6 text-gray-600">
          Masukkan email yang kamu gunakan saat mendaftar. Jika email terdaftar,
          kami akan mengirimkan tautan untuk mengatur ulang password kamu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
            {isLoading ? "Mengirim..." : "Kirim Tautan Reset"}
          </button>
        </form>

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
