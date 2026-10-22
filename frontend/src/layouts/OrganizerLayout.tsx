import ConfirmLogout from "@/components/profile/ConfirmLogout";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";

const menuItems = [
  { label: "Dashboard", to: "/organizer/dashboard" },
  { label: "Event Saya", to: "/organizer/events" },
  { label: "Buat Event", to: "/organizer/events/create" },
  { label: "Transaksi", to: "/organizer/transactions" },
  { label: "Profile", to: "/organizer/profile" },
];

export default function OrganizerLayout() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex md:h-screen md:overflow-hidden">
      <ConfirmLogout
        open={showLogoutConfirm}
        onCancel={handleCancelLogout}
        onConfirm={handleLogout}
      />

      {/* Sidebar: tetap diam, tidak ikut scroll */}
      <aside className="flex w-full shrink-0 flex-col border-r border-gray-200 bg-white p-5 md:h-screen md:w-64 md:overflow-hidden">
        <h1 className="mb-8 shrink-0 text-xl font-bold">Organizer Panel</h1>

        {/* Menu sidebar */}
        <nav className="flex gap-2 overflow-x-auto md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={
                item.to === "/organizer/dashboard" ||
                item.to === "/organizer/events"
              }
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

        {/* Logout: selalu di bagian bawah sidebar */}
        <button
          type="button"
          className="mt-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
          onClick={() => setShowLogoutConfirm(true)}
        >
          Logout
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:h-screen md:overflow-y-auto md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
