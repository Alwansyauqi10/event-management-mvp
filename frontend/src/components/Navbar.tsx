function Navbar() {
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

        {/* Navigation */}
        <div className="flex items-center gap-8 font-manrope text-sm font-bold text-haya-text">
          <a href="/" className="transition hover:text-haya-blue">
            Events
          </a>

          <a href="/" className="transition hover:text-haya-blue">
            Categories
          </a>

          <a href="/" className="transition hover:text-haya-blue">
            About
          </a>
        </div>

        {/* Login */}
        <button className="rounded-3xl bg-haya-blue px-5 py-2 font-manrope text-sm font-semibold text-white transition hover:bg-haya-blue-light">
          Login
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
