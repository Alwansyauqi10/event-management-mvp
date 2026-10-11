import { useState } from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute left-0 top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/HAYA Dark Version.png"
            alt="HAYA"
            className="h-10 w-auto"
          />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 font-manrope text-sm font-bold text-haya-text md:flex">
          <a
            href="/"
            className="transition hover:text-haya-blue"
          >
            Events
          </a>
          <a
            href="/"
            className="transition hover:text-haya-blue"
          >
            Categories
          </a>
          <a
            href="/"
            className="transition hover:text-haya-blue"
          >
            About
          </a>
        </div>

        {/* Desktop Login */}
        <button className="hidden rounded-3xl bg-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-haya-blue-light md:block">
          Login
        </button>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-haya-text md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className="text-2xl">
            {isOpen ? "×" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-6 py-5 shadow-md md:hidden">
          <div className="flex flex-col gap-5 font-manrope text-sm font-bold text-haya-text">
            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className="transition hover:text-haya-blue"
            >
              Events
            </a>

            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className="transition hover:text-haya-blue"
            >
              Categories
            </a>

            <a
              href="/"
              onClick={() => setIsOpen(false)}
              className="transition hover:text-haya-blue"
            >
              About
            </a>

            <button
              onClick={() => setIsOpen(false)}
              className="w-fit rounded-3xl bg-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-haya-blue-light"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;