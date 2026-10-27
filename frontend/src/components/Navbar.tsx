import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useProfile } from "@/hooks/useProfile";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));
  const { data: user } = useProfile();

  const closeMenus = () => {
    setIsOpen(false);
    setIsAccountOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    closeMenus();
    navigate("/login", { replace: true });
  };

  const navLinkClass = "transition-colors duration-200 hover:text-haya-blue";

  const accountLinkClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-haya-text transition-colors hover:bg-blue-50 hover:text-haya-blue";

  const avatar = (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-bold text-haya-blue">
      {user?.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.name}
          className="h-full w-full object-cover"
        />
      ) : (
        (user?.name?.trim()?.charAt(0).toUpperCase() ?? "U")
      )}
    </div>
  );

  return (
    <nav className="relative z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" onClick={closeMenus} className="shrink-0">
          <img
            src="/HAYA Dark Version.png"
            alt="HAYA"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-9 font-manrope text-sm font-semibold text-haya-text md:flex">
          <Link to="/" className={navLinkClass}>
            Events
          </Link>
          <Link to="/" className={navLinkClass}>
            Categories
          </Link>
          <Link to="/" className={navLinkClass}>
            About
          </Link>
        </div>

        {/* Desktop account dropdown */}
        <div className="relative hidden md:block">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => setIsAccountOpen((prev) => !prev)}
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-3 rounded-full border px-2 py-2 transition ${
                  isAccountOpen
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                }`}
              >
                {avatar}

                <span className="max-w-32 truncate text-sm font-semibold text-haya-text">
                  {user?.name ?? "Akun Saya"}
                </span>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-4 w-4 text-slate-500 transition-transform ${
                    isAccountOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isAccountOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Tutup menu akun"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsAccountOpen(false)}
                  />

                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_16px_48px_rgba(15,23,42,0.12)]"
                  >
                    {/* Account identity */}
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-blue-100">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-haya-blue">
                            {user?.name?.trim()?.charAt(0).toUpperCase() ?? "U"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-haya-text">
                          {user?.name ?? "Memuat profil..."}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {user?.email ?? ""}
                        </p>
                      </div>
                    </div>

                    <div className="mx-2 border-t border-slate-100" />

                    <div className="pt-2">
                      {/* Profil */}
                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={closeMenus}
                        className={accountLinkClass}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5 shrink-0"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path
                            d="M4 21a8 8 0 0 1 16 0"
                            strokeLinecap="round"
                          />
                        </svg>
                        Profil Saya
                      </Link>

                      {/* Poin Saya */}
                      <Link
                        to="/profile/points"
                        role="menuitem"
                        onClick={closeMenus}
                        className={accountLinkClass}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5 shrink-0"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path
                            d="M12 7v10M15 9.5c0-1.1-1.3-2-3-2s-3 .7-3 1.8 1.3 1.7 3 2.2 3 1.1 3 2.2-1.3 1.8-3 1.8-3-.9-3-2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Poin Saya
                      </Link>

                      {/* Kupon Saya */}
                      <Link
                        to="/profile/coupons"
                        role="menuitem"
                        onClick={closeMenus}
                        className={accountLinkClass}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5 shrink-0"
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
                        Kupon Saya
                      </Link>

                      {/* Riwayat transaksi */}
                      <Link
                        to="/transaction/history"
                        role="menuitem"
                        onClick={closeMenus}
                        className={accountLinkClass}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5 shrink-0"
                          aria-hidden="true"
                        >
                          <rect x="4" y="3" width="16" height="18" rx="2" />
                          <path
                            d="M8 8h8M8 12h8M8 16h5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Riwayat Transaksi
                      </Link>
                    </div>

                    <div className="my-2 border-t border-slate-100" />

                    {/* Logout */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-5 w-5 shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          d="M10 17l5-5-5-5M15 12H3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
                          strokeLinecap="round"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-haya-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-haya-blue-light"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-haya-text transition hover:bg-slate-100 md:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
        >
          <span className="text-2xl">{isOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-6 pb-6 pt-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1 font-manrope text-sm font-semibold text-haya-text">
            <Link
              to="/"
              onClick={closeMenus}
              className="rounded-xl px-3 py-3 transition hover:bg-slate-50 hover:text-haya-blue"
            >
              Events
            </Link>

            <Link
              to="/"
              onClick={closeMenus}
              className="rounded-xl px-3 py-3 transition hover:bg-slate-50 hover:text-haya-blue"
            >
              Categories
            </Link>

            <Link
              to="/"
              onClick={closeMenus}
              className="rounded-xl px-3 py-3 transition hover:bg-slate-50 hover:text-haya-blue"
            >
              About
            </Link>

            <div className="my-3 border-t border-slate-100" />

            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-blue-100">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-haya-blue">
                        {user?.name?.trim()?.charAt(0).toUpperCase() ?? "U"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-haya-text">
                      {user?.name ?? "Memuat profil..."}
                    </p>
                    <p className="truncate text-xs font-normal text-slate-500">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className={accountLinkClass}
                >
                  Profil Saya
                </Link>

                {/* Poin Saya - Mobile */}
                <Link
                  to="/profile/points"
                  onClick={closeMenus}
                  className={accountLinkClass}
                >
                  Poin Saya
                </Link>

                <Link
                  to="/profile/coupons"
                  role="menuitem"
                  onClick={closeMenus}
                  className={accountLinkClass}
                >
                  <span aria-hidden="true">🎟️</span>
                  Kupon Saya
                </Link>

                <Link
                  to="/transaction/history"
                  onClick={closeMenus}
                  className={accountLinkClass}
                >
                  Riwayat Transaksi
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-fit items-center gap-2 rounded-xl px-3 py-3 text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="mt-1 inline-flex w-fit items-center justify-center rounded-full bg-haya-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-haya-blue-light"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
