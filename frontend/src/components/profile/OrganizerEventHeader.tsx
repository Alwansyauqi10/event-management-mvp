import { CalendarDays, MapPin, Tag } from "lucide-react";
import { Link } from "react-router";

export interface OrganizerEventInfo {
  id: string;
  name: string;
  location: string | null;
  startDate: string;
  endDate?: string;
  categoryId: string | number;
  category?: {
    name: string;
  } | null;
}

interface OrganizerEventHeaderProps {
  title: string;
  description: string;
  event: OrganizerEventInfo;
}

function formatEventDate(value?: string | null) {
  if (!value) return "Tanggal belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default function OrganizerEventHeader({
  title,
  description,
  event,
}: OrganizerEventHeaderProps) {
  const category = event.category?.name ?? `Kategori #${event.categoryId}`;

  const startDate = event.startDate;

  return (
    <div className="space-y-5">
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <span aria-hidden="true">←</span> Kembali ke Event Saya
      </Link>
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
            Organizer Panel / Event Management
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Event
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {event.name}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <Tag className="size-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Kategori</p>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <MapPin className="size-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Lokasi</p>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {event.location || "Lokasi belum tersedia"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <CalendarDays className="size-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Tanggal Mulai</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatEventDate(startDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
