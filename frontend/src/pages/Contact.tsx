import { Link } from "react-router";
import { Mail, ArrowUpRight, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-haya-blue-soft">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 md:px-8 md:py-28 lg:px-10">
          <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
            Contact Us
          </p>

          <h1 className="mt-4 max-w-3xl font-sora text-4xl font-bold leading-tight tracking-tight text-haya-navy md:text-6xl">
            Let&apos;s make your next experience{" "}
            <span className="text-haya-blue">happen.</span>
          </h1>

          <p className="mt-6 max-w-xl font-manrope text-base leading-7 text-haya-muted md:text-lg">
            Have a question about an event or need help with your booking?
            We&apos;re here to help you make the most of every experience.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Left Content */}
          <div>
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
              Get in Touch
            </p>

            <h2 className="mt-4 font-sora text-3xl font-bold leading-tight text-haya-navy md:text-4xl">
              We&apos;d love to hear from you.
            </h2>

            <p className="mt-5 max-w-md font-manrope leading-7 text-haya-muted">
              Whether you need assistance with a booking, have questions about
              an event, or want to collaborate with us, feel free to reach out.
            </p>

            <div className="mt-8 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-haya-blue-soft text-haya-blue">
                <MessageCircle size={22} />
              </div>

              <div>
                <h3 className="font-sora font-semibold text-haya-navy">
                  Need Help?
                </h3>
                <p className="mt-1 max-w-sm font-manrope text-sm leading-6 text-haya-muted">
                  Contact us if you experience any issues with your event
                  booking or transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Cards */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Email */}
            <a
              href="mailto:"
              className="group rounded-2xl border border-haya-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-haya-blue/40 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-haya-blue-soft text-haya-blue">
                <Mail size={22} />
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <h3 className="font-sora text-lg font-semibold text-haya-navy">
                  Email Us
                </h3>
                <ArrowUpRight
                  size={20}
                  className="text-haya-muted transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-haya-blue"
                />
              </div>

              <p className="mt-2 font-manrope text-sm leading-6 text-haya-muted">
                Send us your questions and inquiries.
              </p>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-haya-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-haya-blue/40 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-haya-blue-soft text-haya-blue">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Instagram"
                  role="img"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="0.8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <h3 className="font-sora text-lg font-semibold text-haya-navy">
                  Instagram
                </h3>
                <ArrowUpRight
                  size={20}
                  className="text-haya-muted transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-haya-blue"
                />
              </div>

              <p className="mt-2 font-manrope text-sm leading-6 text-haya-muted">
                Follow our updates and discover upcoming events.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Explore Events CTA */}
      <section className="px-6 py-20 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-haya-navy px-7 py-10 md:flex-row md:items-center md:px-12 md:py-12">
          <div>
            <p className="font-manrope text-sm font-semibold uppercase tracking-[0.15em] text-blue-200">
              Your Next Experience
            </p>

            <h2 className="mt-3 max-w-xl font-sora text-2xl font-bold leading-tight text-white md:text-3xl">
              Ready to discover your next event?
            </h2>

            <p className="mt-3 max-w-xl font-manrope leading-7 text-slate-300">
              Explore events, find your interests, and make every moment count
              with HAYA.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-manrope text-sm font-bold text-haya-navy transition-colors hover:bg-blue-50"
          >
            Explore Events
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
