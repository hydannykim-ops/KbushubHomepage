"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import { PhotoFrame } from "@/components/photo-frame";
import { COVER_PHOTO_COUNT, MAX_LISTING_PHOTOS, textOf } from "@/lib/domain";
import { getDict } from "@/lib/i18n";
import type { Locale, Photo, VehicleClass } from "@/lib/types";

function place(index: number, current: number, total: number) {
  if (total <= 1) return 0;
  let delta = index - current;
  delta = ((delta % total) + total) % total;
  if (delta > total / 2) delta -= total;
  return delta;
}

function Frame({
  photo,
  lang,
  label,
  mode,
}: {
  photo: Photo;
  lang: Locale;
  label: string;
  mode: "cover" | "viewer";
}) {
  const dict = getDict(lang);
  const alt = textOf(photo.alt, lang, label);
  if (photo.file) {
    return (
      <Image
        src={`/stock/${photo.file}`}
        alt={alt}
        width={1600}
        height={1000}
        className={mode === "cover" ? "h-full w-full object-cover" : "max-h-[calc(100vh-11rem)] w-full object-contain"}
      />
    );
  }
  return (
    <PhotoFrame
      kicker={dict.common.slotPhoto}
      caption={`${label} · ${dict.common.photoPending}`}
      fill={mode === "cover"}
      aspect="aspect-[16/10]"
    />
  );
}

export function Gallery({
  photos,
  lang,
}: {
  photos: Photo[];
  lang: Locale;
  variant: VehicleClass;
}) {
  const dict = getDict(lang);
  const all = photos.slice(0, MAX_LISTING_PHOTOS);
  const covers = all.slice(0, COVER_PHOTO_COUNT);
  const [index, setIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [hold, setHold] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduce, setReduce] = useState(false);
  const fromRef = useRef(0);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const from = fromRef.current;

  useEffect(() => {
    fromRef.current = index;
  }, [index]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (covers.length < 2 || hold || hover || open || reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % covers.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [covers.length, hold, hover, open, reduce]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setViewerIndex((current) => (current + 1) % all.length);
      if (event.key === "ArrowLeft") setViewerIndex((current) => (current - 1 + all.length) % all.length);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, all.length]);

  if (!all.length) {
    return (
      <div className="overflow-hidden rounded-[1.25rem]">
        <PhotoFrame kicker={dict.common.slotPhoto} caption={dict.common.photoNone} aspect="aspect-[16/10]" />
      </div>
    );
  }

  const current = covers[Math.min(index, covers.length - 1)];
  const duration = reduce ? "0ms" : "500ms";

  function stepCover(delta: number) {
    setHold(true);
    setIndex((value) => (value + delta + covers.length) % covers.length);
  }

  function openAt(start: number) {
    setViewerIndex(start);
    setOpen(true);
  }

  function onTouchStart(event: TouchEvent) {
    touchX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent) {
    if (touchX.current == null) return;
    const next = event.changedTouches[0]?.clientX ?? touchX.current;
    const delta = next - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) < 40) return;
    swiped.current = true;
    stepCover(delta < 0 ? 1 : -1);
  }

  return (
    <div>
      <p className="text-[12px] font-medium tracking-[0.16em] text-muted">{dict.detail.covers}</p>
      <div
        className="relative mt-3 overflow-hidden rounded-[1.25rem] bg-sand"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative aspect-[16/10]">
          {covers.map((photo, photoIndex) => {
            const delta = place(photoIndex, index, covers.length);
            const previous = place(photoIndex, from, covers.length);
            const leap = Math.abs(delta - previous) > 1;
            const label = textOf(photo.alt, lang, dict.photo[photo.category]);
            return (
              <button
                key={photo.id}
                type="button"
                className={`absolute inset-0 ${photoIndex === index ? "z-[1]" : "pointer-events-none"}`}
                style={{
                  transform: `translate3d(${delta * 100}%, 0, 0)`,
                  transition: leap ? "none" : `transform ${duration} ease`,
                }}
                aria-hidden={photoIndex !== index}
                tabIndex={photoIndex === index ? 0 : -1}
                aria-label={`${dict.a11y.photoOpen}. ${label}`}
                onClick={() => {
                  if (swiped.current) {
                    swiped.current = false;
                    return;
                  }
                  openAt(photoIndex);
                }}
              >
                <Frame photo={photo} lang={lang} label={label} mode="cover" />
              </button>
            );
          })}
          {covers.length > 1 ? (
            <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-3">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full bg-card/95 text-lg text-ink shadow-card"
                aria-label={dict.a11y.photoPrev}
                onClick={() => stepCover(-1)}
              >
                ‹
              </button>
              <div className="flex gap-1.5" aria-hidden="true">
                {covers.map((photo, photoIndex) => (
                  <span
                    key={photo.id}
                    className={`h-1.5 rounded-full ${photoIndex === index ? "w-6 bg-ink" : "w-1.5 bg-ink/30"}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full bg-card/95 text-lg text-ink shadow-card"
                aria-label={dict.a11y.photoNext}
                onClick={() => stepCover(1)}
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        {textOf(current.alt, lang, dict.photo[current.category])} · {index + 1} / {covers.length}
        <span className="mt-1 block">{dict.detail.slideHint}</span>
      </p>
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink px-4 py-4 sm:px-8" role="presentation" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={dict.a11y.gallery}
            className="mx-auto flex h-full w-full max-w-5xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between text-sm text-white">
              <p aria-live="polite">
                {viewerIndex + 1} / {all.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-xl"
                aria-label={dict.a11y.photoClose}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center py-4">
              <div className="max-h-full w-full overflow-hidden rounded-[1.25rem] bg-[#e7e1d6]">
                <Frame
                  photo={all[viewerIndex]}
                  lang={lang}
                  label={textOf(all[viewerIndex].alt, lang, dict.photo[all[viewerIndex].category])}
                  mode="viewer"
                />
              </div>
            </div>
            <p className="text-center text-sm text-white/80">
              {textOf(all[viewerIndex].alt, lang, dict.photo[all[viewerIndex].category])}
            </p>
            {all.length > 1 ? (
              <div className="mt-3 flex justify-center gap-3 pb-1">
                <button
                  type="button"
                  className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-ink"
                  aria-label={dict.a11y.photoPrev}
                  onClick={() => setViewerIndex((value) => (value - 1 + all.length) % all.length)}
                >
                  {dict.a11y.photoPrev}
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-ink"
                  aria-label={dict.a11y.photoNext}
                  onClick={() => setViewerIndex((value) => (value + 1) % all.length)}
                >
                  {dict.a11y.photoNext}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
