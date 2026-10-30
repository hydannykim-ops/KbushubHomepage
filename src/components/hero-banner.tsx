"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  id: string;
  image: string;
  imageAlt: string;
  brand?: string;
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** Overlay tint for slide mood. */
  tone?: "hub" | "sell" | "scrap";
};

const AUTO_MS = 6000;

const toneClass: Record<NonNullable<HeroSlide["tone"]>, string> = {
  hub: "bg-gradient-to-r from-black/78 via-black/55 to-primary/25",
  sell: "bg-gradient-to-r from-black/80 via-black/55 to-accent-warm/30",
  scrap: "bg-gradient-to-r from-black/82 via-[#0f172a]/65 to-primary-deep/35",
};

export function HeroBanner({
  slides,
  prevLabel,
  nextLabel,
}: {
  slides: HeroSlide[];
  prevLabel: string;
  nextLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  function go(next: number) {
    if (count < 1) return;
    setIndex(((next % count) + count) % count);
  }

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  if (!count) return null;
  const active = slides[index] ?? slides[0];

  return (
    <section
      className="relative min-h-[70vh] overflow-hidden border border-line bg-[#0f172a] text-white lg:min-h-[32rem]"
      aria-roledescription="carousel"
      aria-label="K-BUS HUB"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className={`absolute inset-0 ${toneClass[slide.tone ?? "hub"]}`} />
        </div>
      ))}

      <div className="relative flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-14 lg:min-h-[32rem] lg:px-10">
        {active.brand ? (
          <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{active.brand}</p>
        ) : (
          <p className="text-xs font-semibold tracking-[0.16em] text-white/80">{active.primary.label}</p>
        )}
        <h1
          className={`font-semibold leading-snug tracking-tight text-white/95 ${
            active.brand ? "mt-3 text-2xl md:text-3xl" : "mt-3 text-3xl md:text-4xl"
          }`}
        >
          {active.title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/85">{active.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={active.primary.href}
            className="bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(21,94,239,0.35)] transition hover:bg-primary-deep"
          >
            {active.primary.label}
          </Link>
          {active.secondary ? (
            <Link
              href={active.secondary.href}
              className="border border-white/45 bg-white/12 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {active.secondary.label}
            </Link>
          ) : null}
        </div>
      </div>

      {count > 1 ? (
        <>
          <div className="absolute bottom-5 left-6 z-10 flex items-center gap-2 lg:left-10">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-7 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
                }`}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <div className="absolute bottom-4 right-4 z-10 flex gap-2 lg:right-6">
            <button
              type="button"
              aria-label={prevLabel}
              className="border border-white/40 bg-black/25 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
              onClick={() => go(index - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              className="border border-white/40 bg-black/25 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
              onClick={() => go(index + 1)}
            >
              ›
            </button>
          </div>
          <span className="sr-only" aria-live="polite">
            {active.imageAlt}: {active.title}
          </span>
        </>
      ) : null}
    </section>
  );
}
