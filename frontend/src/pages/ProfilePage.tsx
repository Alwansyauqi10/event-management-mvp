import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/axios";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  profilePicture: string | null;
  referralCode: string;
};

function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getProfile = async () => {
    try {
      const response = await api.get("/auth/profile");

      setUser(response.data.user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Memuat profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-4xl">😕</div>

          <h2 className="text-xl font-bold text-slate-900">
            Profile tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Silakan login kembali untuk melanjutkan.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">Account</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola informasi akun kamu
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center gap-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-20 w-20 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white text-2xl font-bold text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.name}</h2>

                <p className="mt-1 text-sm text-blue-100">{user.email}</p>

                <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="mb-5 text-lg font-semibold text-slate-900">
              Informasi Akun
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nama
                </p>

                <p className="mt-1 font-medium text-slate-900">{user.name}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-slate-900">
                  {user.email}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nomor Telepon
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {user.phone || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role
                </p>

                <p className="mt-1 font-medium capitalize text-slate-900">
                  {user.role}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Referral Code
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="font-mono font-semibold tracking-wider text-blue-600">
                    {user.referralCode}
                  </p>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(user.referralCode)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-6">
              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
