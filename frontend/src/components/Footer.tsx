import {
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa6";

import { Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-haya-navy text-white">
      <div className="mx-auto max-w-7xl px-6 py-7">
        {/* Top */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <a href="/" className="inline-flex items-center">
              <img
                src="/HAYA Light Version.png"
                alt="HAYA"
                className="h-10 w-auto"
              />
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-manrope text-sm text-white/60">
            <a
              href="/events"
              className="transition hover:text-white"
            >
              Events
            </a>
            <a
              href="/categories"
              className="transition hover:text-white"
            >
              Categories
            </a>
            <a
              href="/about"
              className="transition hover:text-white"
            >
              About
            </a>
          </nav>

          {/* Social Media */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <FaInstagram className="h-4 w-4" />
            </a>

            <a
              href="#"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <FaYoutube className="h-4 w-4" />
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <FaLinkedinIn className="h-4 w-4" />
            </a>

            <a
              href="mailto:hello@hayaevents.com"
              aria-label="Email"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-manrope text-xs text-white/40">
            © 2026 HAYA. All rights reserved.
          </p>

          <p className="font-manrope text-xs text-white/40">
            Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;