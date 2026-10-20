import { NavLink, Outlet } from "react-router";

const menuItems = [
  { label: "Dashboard", to: "/organizer/dashboard" },
  { label: "Event Saya", to: "/organizer/events" },
  { label: "Buat Event", to: "/organizer/events/create" },
  { label: "Transaksi", to: "/organizer/transactions" },
  { label: "Peserta", to: "/organizer/attendees" },
  { label: "Statistik", to: "/organizer/statistics" },
];

export default function OrganizerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="w-full border-r border-gray-200 bg-white p-5 md:min-h-screen md:w-64">
        <h1 className="mb-8 text-xl font-bold">Organizer Panel</h1>

        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/organizer/dashboard"}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
