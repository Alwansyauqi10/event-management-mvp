
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  getMyCoupons,
  type AvailableCoupon,
} from "@/services/transaction.service";

const formatDiscount = (coupon: AvailableCoupon) => {
  const value = Number(coupon.discountValue);

  return coupon.discountType === "PERCENTAGE"
    ? `${value}%`
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value);
};

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

function CouponPage() {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchCoupons = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyCoupons();

        if (isActive) {
          setCoupons(data);
        }
      } catch (error: unknown) {
        let message = "Kupon gagal dimuat. Silakan coba lagi.";

        if (typeof error === "object" && error !== null && "response" in error) {
          const response = (
            error as {
              response?: {
                data?: {
                  message?: string;
                };
              };
            }
          ).response;

          if (response?.data?.message) {
            message = response.data.message;
          }
        }

        if (isActive) {
          setErrorMessage(message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchCoupons();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Kupon Saya
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Lihat kupon referral aktif yang bisa kamu gunakan saat checkout.
          </p>
        </div>

        <div className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Kupon tersedia
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {isLoading ? "—" : coupons.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Kupon aktif yang belum digunakan.
            </p>
          </div>

          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                d="M4 8a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 8v1m0 3v1m0 3v1m4-8h3m-3 4h3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-950">
            Daftar Kupon
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Periksa nominal diskon dan masa berlaku sebelum checkout.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">Memuat kupon...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-semibold text-red-900">
              Kupon gagal dimuat
            </h2>
            <p className="mt-2 text-sm text-red-800">{errorMessage}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && coupons.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M4 8a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8v1m0 3v1m0 3v1m4-8h3m-3 4h3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Belum ada kupon aktif
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kupon referral yang tersedia akan muncul di halaman ini.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Jelajahi Event
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && coupons.length > 0 && (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <article
                key={coupon.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 8a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 8v1m0 3v1m0 3v1m4-8h3m-3 4h3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-lg font-bold tracking-tight text-slate-950">
                        Kupon Referral
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Diskon untuk transaksi event yang memenuhi ketentuan.
                      </p>

                      <div className="mt-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:min-w-36 sm:text-right">
                    <p className="text-xs text-slate-500">Diskon</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                      {formatDiscount(coupon)}
                    </p>
                  </div>
                </div>

                <div className="my-5 border-t border-slate-100" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Berlaku sampai</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(coupon.endAt)}
                    </p>
                  </div>

                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Pilih Event
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14m-6-6 6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/profile/points"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Lihat Riwayat Poin
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CouponPage;
