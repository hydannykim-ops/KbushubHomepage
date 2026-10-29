"use client";

import { useEffect, useMemo, useState } from "react";
import { MediaSlot } from "@/components/media-slot";
import { photoUrl } from "@/lib/domain/photo-url";
import type { Lang, PhotoCategory, VehiclePhoto } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";
import { photoCategoryList, photoLabel } from "@/lib/labels";

const categories: Array<PhotoCategory | "all"> = ["all", ...photoCategoryList];

function preload(src: string) {
  if (typeof window === "undefined" || !src) return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

export function GalleryClient({ photos, lang }: { photos: VehiclePhoto[]; lang: Lang }) {
  const text = copy(lang);
  const [category, setCategory] = useState<PhotoCategory | "all">("all");
  const visible = useMemo(
    () => photos.filter((photo) => category === "all" || photo.category === category).sort((a, b) => a.sortOrder - b.sortOrder),
    [photos, category],
  );
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const safeIndex = Math.min(index, Math.max(visible.length - 1, 0));
  const current = visible[safeIndex];
  const field = contentFieldLang(lang);
  const mainSrc = current ? photoUrl(current, 1200) : null;
  const fullSrc = current ? photoUrl(current, 1600) : null;

  // Warm thumbs + full images so lightbox opens from cache.
  useEffect(() => {
    for (const photo of visible) {
      const thumb = photoUrl(photo, 320);
      const full = photoUrl(photo, 1600);
      if (thumb) preload(thumb);
      if (full) preload(full);
    }
  }, [visible]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + visible.length) % visible.length);
      if (event.key === "ArrowRight") setIndex((value) => (value + 1) % visible.length);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, visible.length]);

  return (
    <div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`shrink-0 border px-3 py-1 text-sm ${category === item ? "border-primary bg-primary text-white" : "border-line bg-white"}`}
            onClick={() => {
              setCategory(item);
              setIndex(0);
            }}
          >
            {item === "all" ? text.all : photoLabel(item, lang)}
          </button>
        ))}
      </div>
      {!current || !mainSrc ? (
        <div className="aspect-[16/10] overflow-hidden border border-line bg-white">
          <MediaSlot label={text.mediaCover} hint={text.photoNone} />
        </div>
      ) : (
        <figure className="overflow-hidden border border-line bg-white">
          <button
            type="button"
            className="relative block aspect-[16/10] w-full bg-[#f3f5f8]"
            onClick={() => setLightbox(true)}
            aria-label={text.photos}
          >
            {current.placeholder && !current.path ? (
              <MediaSlot label={photoLabel(current.category, lang)} hint={text.mediaCoverHint} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainSrc}
                alt={field === "ko" ? current.altKo : current.altEn}
                className="h-full w-full object-cover"
                decoding="async"
                fetchPriority="high"
              />
            )}
          </button>
          <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-muted">
            <span>{photoLabel(current.category, lang)}</span>
            <span>
              <button type="button" className="px-2" onClick={() => setIndex((value) => (value - 1 + visible.length) % visible.length)} aria-label="previous">
                ‹
              </button>
              {safeIndex + 1} / {visible.length}
              <button type="button" className="px-2" onClick={() => setIndex((value) => (value + 1) % visible.length)} aria-label="next">
                ›
              </button>
            </span>
          </figcaption>
        </figure>
      )}
      {visible.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {visible.map((photo, photoIndex) => {
            const thumb = photoUrl(photo, 320);
            return (
              <button
                key={photo.id}
                type="button"
                className={`overflow-hidden rounded border ${photo.id === current?.id ? "border-primary" : "border-line"}`}
                onClick={() => {
                  setIndex(photoIndex);
                  setLightbox(true);
                }}
              >
                {photo.placeholder && !photo.path ? (
                  <span className="flex aspect-[16/10] items-center justify-center bg-[#f3f5f8] px-1 text-center text-xs font-semibold text-foreground">
                    {photoLabel(photo.category, lang)}
                  </span>
                ) : thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" decoding="async" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {lightbox && current && fullSrc ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={text.photos}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute right-3 top-3 rounded bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink"
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            ×
          </button>
          {visible.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 z-[1] -translate-y-1/2 rounded bg-white/90 px-3 py-2 text-xl text-ink sm:left-4"
                aria-label="previous"
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex((value) => (value - 1 + visible.length) % visible.length);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 z-[1] -translate-y-1/2 rounded bg-white/90 px-3 py-2 text-xl text-ink sm:right-4"
                aria-label="next"
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex((value) => (value + 1) % visible.length);
                }}
              >
                ›
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullSrc}
            alt={field === "ko" ? current.altKo : current.altEn}
            className="max-h-[90vh] max-w-full object-contain"
            decoding="async"
            fetchPriority="high"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
