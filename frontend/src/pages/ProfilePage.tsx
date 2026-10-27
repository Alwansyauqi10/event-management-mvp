import ChangePasswordModal from "@/components/ui/ChangePasswordModal";
import ConfirmChangePassword from "@/components/ui/ConfirmChangePassword";
import ConfirmEditProfile from "@/components/ui/ConfirmEditProfile";
import ConfirmLogout from "@/components/ui/ConfirmLogout";
import EditProfileForm from "@/components/ui/EditProfileForm";
import LogoutButton from "@/components/ui/LogoutButton";
import { useChangePassword, useUpdateProfile } from "@/hooks/useAuth";
import { useCoupons } from "@/hooks/useCoupons";
import { usePoints } from "@/hooks/usePoint";
import { usePointHistory } from "@/hooks/usePointHistory";
import { useProfile, useUploadProfilePicture } from "@/hooks/useProfile";
import type { ChangePasswordSchema, UpdateProfileSchema } from "@/schema/auth";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Coins,
  Copy,
  Gift,
  History,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  TicketPercent,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

function ProfilePage() {
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<UpdateProfileSchema | null>(
    null,
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: points,
    isLoading: isPointsLoading,
    isError: isPointsError,
  } = usePoints();

  const {
    data: pointHistory,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = usePointHistory();

  const {
    data: coupons,
    isLoading: isCouponsLoading,
    isError: isCouponsError,
  } = useCoupons();

  const { mutate: uploadProfilePicture, isPending: isUploading } =
    useUploadProfilePicture();

  const { mutate, isPending } = useUpdateProfile();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [pendingPasswordData, setPendingPasswordData] =
    useState<ChangePasswordSchema | null>(null);

  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadProfilePicture = () => {
    if (!selectedFile) return;

    uploadProfilePicture(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        setPreviewUrl(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const handleUpdateProfile = (values: UpdateProfileSchema) => {
    setPendingData(values);
    setShowConfirm(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPendingData(null);
  };

  const handleConfirmUpdate = () => {
    if (!pendingData) return;

    mutate(pendingData, {
      onSuccess: () => {
        setIsEditing(false);
        setShowConfirm(false);
        setPendingData(null);
      },
    });
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingData(null);
  };

  const handleChangePassword = (values: ChangePasswordSchema) => {
    setPendingPasswordData(values);
    setShowChangePassword(false);
    setShowPasswordConfirm(true);
  };

  const handleConfirmChangePassword = () => {
    if (!pendingPasswordData) return;

    changePassword(pendingPasswordData, {
      onSuccess: () => {
        setShowPasswordConfirm(false);
        setPendingPasswordData(null);
      },
    });
  };

  const handleCancelChangePassword = () => {
    setShowChangePassword(false);
  };

  const handleCancelPasswordConfirm = () => {
    setShowPasswordConfirm(false);
    setPendingPasswordData(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error("Gagal menyalin teks:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-10 py-8 shadow-sm">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <div className="text-center">
            <p className="font-semibold text-slate-800">Memuat profile</p>
            <p className="mt-1 text-sm text-slate-500">
              Mohon tunggu sebentar...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
            😕
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Profile tidak ditemukan
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kami tidak dapat memuat informasi akun kamu. Silakan login kembali
            untuk melanjutkan.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Login Kembali
          </button>
        </div>
      </div>
    );
  }

  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <ChangePasswordModal
        open={showChangePassword}
        onSubmit={handleChangePassword}
        onCancel={handleCancelChangePassword}
        isPending={isChangingPassword}
      />

      <ConfirmChangePassword
        open={showPasswordConfirm}
        onCancel={handleCancelPasswordConfirm}
        onConfirm={handleConfirmChangePassword}
        isPending={isChangingPassword}
      />

      <ConfirmEditProfile
        open={showConfirm}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirmUpdate}
        isPending={isPending}
      />

      <ConfirmLogout
        open={showLogoutConfirm}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
      />

      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Profile Saya
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                Halo, {firstName}! Kelola informasi dan aktivitas akun kamu di
                sini.
              </p>
            </div>
          </div>
        </div>

        {/* Profile hero */}
        <section className="relative mb-6 overflow-hidden rounded-3xl bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 shadow-xl shadow-blue-900/10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8 lg:p-10">
            <div className="relative shrink-0 self-start">
              {previewUrl || user.profilePicture ? (
                <img
                  src={previewUrl ?? user.profilePicture ?? ""}
                  alt={user.name}
                  className="h-24 w-24 rounded-2xl border-4 border-white/30 object-cover shadow-lg sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white/30 bg-white text-4xl font-bold text-blue-700 shadow-lg sm:h-28 sm:w-28">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-blue-600 bg-white text-blue-700 shadow-sm">
                <Camera className="h-4 w-4" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="min-w-0 flex-1 text-white">
              <p className="text-sm font-medium text-blue-100">
                Selamat datang kembali,
              </p>

              <h2 className="mt-1 wrap-break-words text-2xl font-bold sm:text-3xl">
                {user.name}
              </h2>

              <p className="mt-2 flex items-center gap-2 break-all text-sm text-blue-100">
                <Mail className="h-4 w-4 shrink-0" />
                {user.email}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
                  {user.role}
                </span>

                {user.profilePicture && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Foto profil tersedia
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 sm:max-w-48 sm:justify-end">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                Ganti Foto
              </button>

              {selectedFile && (
                <>
                  <button
                    type="button"
                    onClick={handleUploadProfilePicture}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploading ? "Mengunggah..." : "Simpan Foto"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    disabled={isUploading}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Batal
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Account information */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Informasi Akun
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Informasi dasar yang terhubung dengan akun kamu.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="p-5 sm:p-7">
            {isEditing ? (
              <EditProfileForm
                name={user.name}
                phone={user.phone}
                onSubmit={handleUpdateProfile}
                onCancel={handleCancelEdit}
                isPending={isPending}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Nama Lengkap
                    </p>
                    <p className="mt-1 wrap-break-words font-semibold text-slate-800">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 break-all font-semibold text-slate-800">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Nomor Telepon
                    </p>
                    <p className="mt-1 wrap-break-words font-semibold text-slate-800">
                      {user.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Role Akun
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {user.role === "ORGANIZER" ? "Organizer" : "Customer"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Customer-only rewards */}
        {user.role === "CUSTOMER" && (
          <>
            <section className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Poin & Reward
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pantau saldo poin dan manfaat referral yang kamu dapatkan.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-900/10">
                  <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-white/10" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-100">
                        Saldo Poin Kamu
                      </p>

                      {isPointsLoading ? (
                        <p className="mt-4 text-sm text-blue-100">
                          Memuat saldo...
                        </p>
                      ) : isPointsError ? (
                        <p className="mt-4 text-sm text-red-100">
                          Saldo gagal dimuat.
                        </p>
                      ) : (
                        <p className="mt-2 text-3xl font-bold tracking-tight">
                          {Number(points ?? "0").toLocaleString("id-ID")}
                          <span className="ml-2 text-base font-medium text-blue-100">
                            poin
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                      <Coins className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="relative mt-5 text-xs leading-5 text-blue-100">
                    Poin yang kamu kumpulkan bisa menjadi bagian dari manfaat
                    akunmu.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Kode Referral
                      </p>
                      <p className="mt-3 break-all font-mono text-xl font-bold tracking-wider text-blue-700">
                        {user.referralCode || "-"}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Gift className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Bagikan kode referral untuk mengajak teman bergabung.
                  </p>

                  <button
                    type="button"
                    onClick={() => void handleCopy(user.referralCode)}
                    disabled={!user.referralCode}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Copy className="h-4 w-4" />
                    Salin Kode
                  </button>
                </div>
              </div>
            </section>

            {/* Point history */}
            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Riwayat Poin</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Aktivitas poin terbaru kamu.
                    </p>
                  </div>
                </div>

                <Link
                  to="/profile/points"
                  className="inline-flex items-center gap-1 self-start text-sm font-semibold text-blue-600 transition hover:text-blue-800 sm:self-center"
                >
                  Lihat Semua <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="px-5 sm:px-7">
                {isHistoryLoading ? (
                  <p className="py-6 text-sm text-slate-500">
                    Memuat riwayat poin...
                  </p>
                ) : isHistoryError ? (
                  <p className="py-6 text-sm text-red-600">
                    Riwayat poin gagal dimuat.
                  </p>
                ) : !pointHistory?.length ? (
                  <div className="py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <History className="h-6 w-6" />
                    </div>
                    <p className="mt-3 font-semibold text-slate-700">
                      Belum ada riwayat poin
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Aktivitas poin kamu akan ditampilkan di sini.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pointHistory.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Coins className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {item.type}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {new Date(item.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-slate-800">
                          {Number(item.amount).toLocaleString("id-ID")} poin
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Coupons */}
            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                    <TicketPercent className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">Kupon Saya</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Kupon diskon referral yang kamu miliki.
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                  {isCouponsLoading
                    ? "Memuat..."
                    : `${coupons?.length ?? 0} kupon`}
                </span>
              </div>

              <div className="p-5 sm:p-7">
                {isCouponsLoading ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-sm text-slate-500">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                    Memuat kupon...
                  </div>
                ) : isCouponsError ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                    Gagal memuat kupon. Silakan coba lagi.
                  </div>
                ) : !coupons?.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                      <TicketPercent className="h-7 w-7" />
                    </div>

                    <p className="mt-4 font-semibold text-slate-800">
                      Belum ada kupon
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      Kupon yang kamu miliki akan muncul di sini setelah
                      tersedia.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {coupons.map((coupon) => {
                      const statusStyles: Record<string, string> = {
                        ACTIVE:
                          "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
                        USED: "bg-blue-50 text-blue-700 ring-blue-600/20",
                        EXPIRED: "bg-red-50 text-red-700 ring-red-600/20",
                      };

                      const statusLabels: Record<string, string> = {
                        ACTIVE: "Aktif",
                        USED: "Digunakan",
                        EXPIRED: "Kedaluwarsa",
                      };

                      return (
                        <article
                          key={coupon.id}
                          className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5"
                        >
                          <div className="flex">
                            <div className="flex w-2 shrink-0 flex-col bg-linear-to-b from-blue-500 to-indigo-600" />

                            <div className="min-w-0 flex-1 p-4 sm:p-5">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Kode Kupon
                                  </p>
                                  <p className="mt-1 break-all font-mono text-lg font-bold tracking-wide text-slate-900">
                                    {coupon.code}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                                    statusStyles[coupon.status] ??
                                    "bg-amber-50 text-amber-700 ring-amber-600/20"
                                  }`}
                                >
                                  {statusLabels[coupon.status] ??
                                    "Belum berlaku"}
                                </span>
                              </div>

                              <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Diskon
                                  </p>
                                  <p className="mt-1 text-xl font-bold text-blue-700">
                                    {coupon.discountType === "PERCENTAGE"
                                      ? `${coupon.discountValue}%`
                                      : `Rp ${Number(
                                          coupon.discountValue,
                                        ).toLocaleString("id-ID")}`}
                                  </p>
                                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Berlaku sampai{" "}
                                    {new Date(coupon.endAt).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => void handleCopy(coupon.code)}
                                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Salin
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Security */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Keamanan Akun</h3>
              <p className="mt-1 text-sm text-slate-500">
                Jaga keamanan akun dengan password yang kuat.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="font-semibold text-slate-800">Password</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ubah password secara berkala untuk menjaga keamanan akun kamu.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <LockKeyhole className="h-4 w-4" />
              Ubah Password
            </button>
          </div>
        </section>

        {/* Logout */}
        <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-semibold text-slate-800">Keluar dari akun?</p>
            <p className="mt-1 text-sm text-slate-500">
              Pastikan aktivitas kamu sudah selesai sebelum logout.
            </p>
          </div>

          <div className="shrink-0">
            <LogoutButton onClick={() => setShowLogoutConfirm(true)} />
          </div>
        </div>

        <p className="mt-6 pb-2 text-center text-xs text-slate-400">
          Informasi akun kamu hanya dapat dikelola setelah login.
        </p>
      </div>
    </div>
  );
}

export default ProfilePage;
