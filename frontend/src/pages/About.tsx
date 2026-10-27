import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Heart,
  Sparkles,
} from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-haya-blue-soft">
        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl md:h-96 md:w-96" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-24 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-10">
          <div>
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
              About HAYA
            </p>

            <h1 className="mt-5 max-w-3xl font-sora text-4xl font-bold leading-tight tracking-tight text-haya-navy sm:text-5xl md:text-6xl lg:text-7xl">
              More than events.
              <span className="mt-2 block text-haya-blue">
                Moments that matter.
              </span>
            </h1>

            <p className="mt-7 max-w-xl font-manrope text-base leading-8 text-haya-muted md:text-lg">
              HAYA is a platform designed to help you discover events,
              explore new interests, and find experiences worth being part of.
              Your next memorable moment starts with a discovery.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-haya-navy px-6 py-3.5 font-manrope text-sm font-bold text-white transition-colors hover:bg-haya-blue"
              >
                Explore Events
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-haya-border bg-white/60 px-6 py-3.5 font-manrope text-sm font-bold text-haya-navy transition-colors hover:border-haya-blue hover:text-haya-blue"
              >
                Get in Touch
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="relative overflow-hidden rounded-3xl bg-haya-navy p-7 sm:p-10">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/10" />
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />

              <div className="relative flex min-h-[340px] flex-col justify-between sm:min-h-[400px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Sparkles size={27} strokeWidth={1.6} />
                </div>

                <div className="py-10">
                  <p className="font-manrope text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
                    The HAYA Perspective
                  </p>

                  <h2 className="mt-5 font-sora text-3xl font-semibold leading-snug text-white sm:text-4xl">
                    Discover something new.
                    <span className="block text-blue-200">
                      Experience more.
                    </span>
                  </h2>

                  <p className="mt-5 max-w-sm font-manrope text-sm leading-7 text-slate-300">
                    Find events that bring people together through shared
                    interests and experiences.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/15 pt-5">
                  <span className="font-sora text-sm font-semibold tracking-wide text-white">
                    HAYA
                  </span>
                  <span className="font-manrope text-xs text-slate-400">
                    Find your next experience
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
          <div>
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
              Who We Are
            </p>

            <h2 className="mt-4 max-w-sm font-sora text-3xl font-bold leading-tight text-haya-navy md:text-4xl">
              Every experience begins with a discovery.
            </h2>
          </div>

          <div className="space-y-5 font-manrope leading-8 text-haya-muted">
            <p>
              Finding an event should be simple. Whether you want to explore
              a new hobby, spend time with friends, or try something outside
              your routine, the right experience can start with a single
              discovery.
            </p>

            <p>
              HAYA brings event discovery and booking into one place, helping
              you explore available experiences and choose the ones that
              match your interests.
            </p>

            <p>
              We believe events are more than entries on a calendar. They are
              opportunities to connect, learn, explore, and create memories
              along the way.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28 lg:px-10">
          <div className="max-w-2xl">
            <p className="font-manrope text-sm font-bold uppercase tracking-[0.2em] text-haya-blue">
              What Matters to Us
            </p>

            <h2 className="mt-4 font-sora text-3xl font-bold leading-tight text-haya-navy md:text-4xl">
              Built around better experiences.
            </h2>

            <p className="mt-5 font-manrope leading-7 text-haya-muted">
              Our approach is centered on making it easier to find events
              and take the next step toward an experience you will enjoy.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-haya-border bg-white p-7 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-haya-blue-soft text-haya-blue">
                <Compass size={23} />
              </div>

              <h3 className="mt-6 font-sora text-xl font-semibold text-haya-navy">
                Discover
              </h3>

              <p className="mt-3 font-manrope text-sm leading-7 text-haya-muted">
                Explore different events and find activities that align
                with your interests.
              </p>
            </article>

            <article className="rounded-2xl border border-haya-border bg-white p-7 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-haya-blue-soft text-haya-blue">
                <Heart size={23} />
              </div>

              <h3 className="mt-6 font-sora text-xl font-semibold text-haya-navy">
                Connect
              </h3>

              <p className="mt-3 font-manrope text-sm leading-7 text-haya-muted">
                Find opportunities to share interests and spend meaningful
                time with others.
              </p>
            </article>

            <article className="rounded-2xl border border-haya-border bg-white p-7 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-haya-blue-soft text-haya-blue">
                <Sparkles size={23} />
              </div>

              <h3 className="mt-6 font-sora text-xl font-semibold text-haya-navy">
                Experience
              </h3>

              <p className="mt-3 font-manrope text-sm leading-7 text-haya-muted">
                Turn your plans into real experiences, one event at a time.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 md:px-8 md:py-24 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-3xl bg-haya-navy px-7 py-10 md:flex-row md:items-center md:px-12 md:py-14">
          <div>
            <p className="font-manrope text-sm font-semibold uppercase tracking-[0.15em] text-blue-200">
              Start Exploring
            </p>

            <h2 className="mt-3 max-w-2xl font-sora text-2xl font-bold leading-tight text-white md:text-4xl">
              Your next great experience is waiting.
            </h2>

            <p className="mt-4 max-w-xl font-manrope leading-7 text-slate-300">
              Browse events, discover new interests, and find something
              worth looking forward to.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-manrope text-sm font-bold text-haya-navy transition-colors hover:bg-blue-50"
          >
            Find Events
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}