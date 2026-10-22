import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useOrganizerStatistics } from "@/hooks/useOrganizerStatistics";
import type { StatisticsPeriod } from "@/services/event.service";

const currentDate = new Date();

const formatRupiah = (value: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

export default function OrganizerStatisticsChart() {
  const [period, setPeriod] = useState<StatisticsPeriod>("monthly");
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const { data, isPending, isError, refetch } = useOrganizerStatistics({
    period,
    year,
    ...(period === "daily" ? { month } : {}),
  });

  const chartData = (data?.data ?? []).map((item) => ({
    ...item,
    revenueValue: Number(item.revenue),
    label:
      period === "daily"
        ? item.date.slice(-2)
        : period === "monthly"
          ? new Date(`${item.date}-01T00:00:00Z`).toLocaleDateString("id-ID", {
              month: "short",
              timeZone: "UTC",
            })
          : item.date,
  }));

  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Statistik Performa</h2>
        <p className="mt-1 text-sm text-gray-500">
          Pendapatan dari transaksi yang sudah selesai.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value as StatisticsPeriod)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="daily">Harian</option>
          <option value="monthly">Bulanan</option>
          <option value="yearly">Tahunan</option>
        </select>

        <select
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {Array.from(
            { length: 5 },
            (_, index) => currentDate.getFullYear() - index,
          ).map((itemYear) => (
            <option key={itemYear} value={itemYear}>
              {itemYear}
            </option>
          ))}
        </select>

        {period === "daily" && (
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (itemMonth) => (
                <option key={itemMonth} value={itemMonth}>
                  {new Date(
                    Date.UTC(year, itemMonth - 1, 1),
                  ).toLocaleDateString("id-ID", {
                    month: "long",
                    timeZone: "UTC",
                  })}
                </option>
              ),
            )}
          </select>
        )}
      </div>

      {isPending ? (
        <p className="py-12 text-center text-sm text-gray-500">
          Memuat statistik...
        </p>
      ) : isError ? (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600">Gagal memuat statistik.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 12, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("id-ID", {
                      notation: "compact",
                    }).format(value)
                  }
                  width={65}
                />
                <Tooltip
                  formatter={(value) => [
                    formatRupiah(Number(value)),
                    "Pendapatan",
                  ]}
                />
                <Bar
                  dataKey="revenueValue"
                  name="Pendapatan"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Total transaksi pada periode ini
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {chartData
                .reduce((total, item) => total + item.transactions, 0)
                .toLocaleString("id-ID")}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
