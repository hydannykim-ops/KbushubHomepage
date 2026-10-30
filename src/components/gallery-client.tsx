"use client";

import { useEffect, useMemo, useState } from "react";
import { MediaSlot } from "@/components/media-slot";
import { photoUrl } from "@/lib/domain/photo-url";
import type { Lang, VehiclePhoto } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";
import { photoLabel } from "@/lib/labels";

function preload(src: string) {
  if (typeof window === "undefined" || !src) return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

export function GalleryClient({ photos, lang }: { photos: VehiclePhoto[]; lang: Lang }) {
  const text = copy(lang);
  const visible = useMemo(() => [...photos].sort((a, b) => a.sortOrder - b.sortOrder), [photos]);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const safeIndex = Math.min(index, Math.max(visible.length - 1, 0));
  const current = visible[safeIndex];
  const field = contentFieldLang(lang);
  const mainSrc = current ? photoUrl(current, 1200) : null;
  const fullSrc = current ? photoUrl(current, 1600) : null;
  const many = visible.length > 1;

  function goPrev() {
    setIndex((value) => (value - 1 + visible.length) % visible.length);
  }
  function goNext() {
    setIndex((value) => (value + 1) % visible.length);
  }

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
      if (event.key === "ArrowLeft" && many) goPrev();
      if (event.key === "ArrowRight" && many) goNext();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, visible.length, many]);

  return (
    <div>
      {!current || !mainSrc ? (
        <div className="aspect-[16/10] overflow-hidden border border-line bg-white">
          <MediaSlot label={text.mediaCover} hint={text.photoNone} />
        </div>
      ) : (
        <figure className="overflow-hidden border border-line bg-white">
          <div className="relative aspect-[16/10] bg-[#f3f5f8]">
            {current.placeholder && !current.path ? (
              <MediaSlot label={photoLabel(current.category, lang)} hint={text.mediaCoverHint} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainSrc}
                alt={field === "ko" ? current.altKo : current.altEn}
                className="pointer-events-none h-full w-full object-cover"
                decoding="async"
                fetchPriority="high"
              />
            )}
            {many ? (
              <>
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-w-resize bg-transparent"
                  aria-label="previous"
                  onClick={goPrev}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-e-resize bg-transparent"
                  aria-label="next"
                  onClick={goNext}
                />
              </>
            ) : (
              <button
                type="button"
                className="absolute inset-0 z-10 bg-transparent"
                aria-label={text.photos}
                onClick={() => setLightbox(true)}
              />
            )}
            {many ? (
              <button
                type="button"
                className="absolute bottom-2 right-2 z-20 rounded bg-black/55 px-2.5 py-1 text-xs font-medium text-white"
                onClick={() => setLightbox(true)}
              >
                {text.photos}
              </button>
            ) : null}
          </div>
          {many ? (
            <figcaption className="flex items-center justify-end gap-3 px-3 py-2 text-sm text-muted">
              <span>
                <button type="button" className="px-2" onClick={goPrev} aria-label="previous">
                  ‹
                </button>
                {safeIndex + 1} / {visible.length}
                <button type="button" className="px-2" onClick={goNext} aria-label="next">
                  ›
                </button>
              </span>
            </figcaption>
          ) : null}
        </figure>
      )}

      {many ? (
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
                  <span className="flex aspect-[16/10] items-center justify-center bg-[#f3f5f8] text-xs font-semibold text-muted">
                    {photoIndex + 1}
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
            className="absolute right-3 top-3 z-[2] rounded bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink"
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            ×
          </button>
          {many ? (
            <>
              <button
                type="button"
                className="absolute inset-y-0 left-0 z-[1] w-1/2 cursor-w-resize bg-transparent"
                aria-label="previous"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 z-[1] w-1/2 cursor-e-resize bg-transparent"
                aria-label="next"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
              />
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullSrc}
            alt={field === "ko" ? current.altKo : current.altEn}
            className="pointer-events-none relative z-0 max-h-[90vh] max-w-full object-contain"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      ) : null}
    </div>
  );
}
