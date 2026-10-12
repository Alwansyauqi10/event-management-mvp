import { Link } from "react-router";
import { usePointHistory } from "@/hooks/usePointHistory";

function PointHistoryPage() {
  const { data: pointHistory, isLoading, isError } = usePointHistory();

  return (
    <div className="min-h-[80vh] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 mt-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Riwayat Poin</h1>
            <p className="mt-2 text-sm text-slate-500">
              Lihat seluruh transaksi poin akun kamu.
            </p>
          </div>
          <div className="px-4">
            <Link
              to="/profile"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Kembali ke Profil
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <p className="text-sm text-slate-500">Memuat riwayat poin...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">
              Riwayat poin gagal dimuat. Silakan coba lagi.
            </p>
          ) : !pointHistory?.length ? (
            <p className="text-sm text-slate-500">Belum ada riwayat poin.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pointHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.type}</p>

                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(item.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    {item.expiredAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        Kedaluwarsa:{" "}
                        {new Date(item.expiredAt).toLocaleDateString("id-ID")}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <p className="font-semibold text-slate-900">
                      {Number(item.amount).toLocaleString("id-ID")} poin
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Sisa:{" "}
                      {Number(item.remainingAmount).toLocaleString("id-ID")}{" "}
                      poin
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PointHistoryPage;
