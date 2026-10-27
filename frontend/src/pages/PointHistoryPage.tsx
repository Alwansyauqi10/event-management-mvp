
import { usePointHistory } from "@/hooks/usePointHistory";
import { Link, useNavigate } from "react-router";

function PointHistoryPage() {
  const navigate = useNavigate();
  const { data: pointHistory, isLoading, isError } = usePointHistory();

  const totalPoints = (pointHistory ?? []).reduce(
    (total, item) => total + Number(item.remainingAmount),
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Riwayat Poin
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pantau perolehan, penggunaan, dan riwayat poin akun kamu.
          </p>
        </div>

        <div className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total sisa poin
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {isLoading
                ? "—"
                : totalPoints.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Akumulasi sisa poin dari riwayat akun kamu.
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
              <circle cx="12" cy="12" r="9" />
              <path
                d="M12 7v10M15 9.5c0-1.1-1.3-2-3-2s-3 .7-3 1.8 1.3 1.7 3 2.2 3 1.1 3 2.2-1.3 1.8-3 1.8-3-.9-3-2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">
              Aktivitas Poin
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Seluruh aktivitas poin yang tercatat di akun kamu.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Memuat riwayat poin...
            </p>
          </div>
        )}

        {!isLoading && isError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-semibold text-red-900">
              Riwayat poin gagal dimuat
            </h2>
            <p className="mt-2 text-sm text-red-800">
              Silakan coba muat ulang halaman.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!isLoading && !isError && (!pointHistory || pointHistory.length === 0) && (
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
                <circle cx="12" cy="12" r="9" />
                <path
                  d="M12 7v10M15 9.5c0-1.1-1.3-2-3-2s-3 .7-3 1.8 1.3 1.7 3 2.2 3 1.1 3 2.2-1.3 1.8-3 1.8-3-.9-3-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Belum ada riwayat poin
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Perolehan dan penggunaan poin kamu akan muncul di halaman ini.
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

        {!isLoading && !isError && pointHistory && pointHistory.length > 0 && (
          <div className="space-y-4">
            {pointHistory.map((item) => (
              <article
                key={item.id}
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
                        <circle cx="12" cy="12" r="9" />
                        <path
                          d="M12 7v10M15 9.5c0-1.1-1.3-2-3-2s-3 .7-3 1.8 1.3 1.7 3 2.2 3 1.1 3 2.2-1.3 1.8-3 1.8-3-.9-3-2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <h2 className="font-bold tracking-tight text-slate-950">
                        {item.type}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {item.expiredAt && (
                        <p className="mt-2 text-xs text-slate-500">
                          Kedaluwarsa:{" "}
                          {new Date(item.expiredAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:min-w-36 sm:text-right">
                    <p className="text-xs text-slate-500">Jumlah poin</p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                      {Number(item.amount).toLocaleString("id-ID")}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">poin</p>
                  </div>
                </div>

                <div className="my-5 border-t border-slate-100" />

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">Sisa poin</span>
                  <span className="font-semibold text-slate-900">
                    {Number(item.remainingAmount).toLocaleString("id-ID")} poin
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/profile/coupons"
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Lihat Kupon Saya
          </Link>
        </div>
      </div>
    </main>
  );
}

export default PointHistoryPage;
