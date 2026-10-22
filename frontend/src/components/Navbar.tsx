import { useState } from "react";
import { Link, useNavigate } from "react-router";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Cek apakah user sudah login
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <nav className="absolute left-0 top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/HAYA Dark Version.png"
            alt="HAYA"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 font-manrope text-sm font-bold text-haya-text md:flex">
          <Link to="/" className="transition hover:text-haya-blue">
            Events
          </Link>
          <Link to="/" className="transition hover:text-haya-blue">
            Categories
          </Link>
          <Link to="/" className="transition hover:text-haya-blue">
            About
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="rounded-3xl border border-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-haya-blue transition hover:bg-blue-50"
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-3xl bg-red-600 px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-3xl bg-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-haya-blue-light"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-haya-text md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className="text-2xl">{isOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-6 py-5 shadow-md md:hidden">
          <div className="flex flex-col gap-5 font-manrope text-sm font-bold text-haya-text">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="transition hover:text-haya-blue"
            >
              Events
            </Link>

            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="transition hover:text-haya-blue"
            >
              Categories
            </Link>

            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="transition hover:text-haya-blue"
            >
              About
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-fit rounded-3xl border border-haya-blue px-5 py-2 text-haya-blue transition hover:bg-blue-50"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-fit rounded-3xl bg-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-haya-blue-light"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-fit rounded-3xl bg-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-haya-blue-light"
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
