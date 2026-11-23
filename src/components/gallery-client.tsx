"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MediaSlot } from "@/components/media-slot";
import { photoUrl } from "@/lib/domain/photo-url";
import type { Lang, VehiclePhoto } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";
import { photoLabel } from "@/lib/labels";

/** Same size the stage shows, so a flip reuses a file that is already in the browser cache. */
const STAGE_WIDTH = 1200;
/** Side gutters stay black so the photo can grow to the top and bottom and the arrows sit beside it. */
const GUTTER = "px-10 sm:px-14";
/** How many photos on either side stay mounted and downloading while the current one is on screen. */
const LOOKAHEAD = 3;
/** Thumbnail strip shows one row of this many at a time. */
const THUMBS_PER_PAGE = 6;

function ringDistance(from: number, to: number, length: number) {
  const raw = Math.abs(from - to);
  return Math.min(raw, length - raw);
}

function warmIndexes(index: number, length: number) {
  const indexes = new Set<number>();
  if (length <= 0) return indexes;
  for (let step = 0; step <= LOOKAHEAD; step += 1) {
    indexes.add((index + step) % length);
    indexes.add((index - step + length) % length);
  }
  return indexes;
}

export function GalleryClient({ photos, lang }: { photos: VehiclePhoto[]; lang: Lang }) {
  const text = copy(lang);
  const visible = useMemo(() => [...photos].sort((a, b) => a.sortOrder - b.sortOrder), [photos]);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [ready, setReady] = useState<Record<string, true>>({});
  const [sharp, setSharp] = useState<Record<string, true>>({});
  const [hold, setHold] = useState(0);
  const safeIndex = Math.min(index, Math.max(visible.length - 1, 0));
  const current = visible[safeIndex];
  const field = contentFieldLang(lang);
  const many = visible.length > 1;
  const currentReady = !current || isPlaceholder(current) || Boolean(ready[current.id]);
  const displayIndex = currentReady ? safeIndex : Math.min(hold, Math.max(visible.length - 1, 0));
  const shown = visible[displayIndex];
  const thumbPageCount = Math.max(1, Math.ceil(visible.length / THUMBS_PER_PAGE));
  const thumbPage = Math.min(Math.floor(safeIndex / THUMBS_PER_PAGE), thumbPageCount - 1);
  const pageThumbs = visible.slice(thumbPage * THUMBS_PER_PAGE, thumbPage * THUMBS_PER_PAGE + THUMBS_PER_PAGE);
  const canPageThumbs = visible.length > THUMBS_PER_PAGE;

  const markReady = useCallback((id: string) => {
    setReady((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  useEffect(() => {
    if (currentReady) setHold(safeIndex);
  }, [currentReady, safeIndex]);

  const goPrev = useCallback(() => {
    setIndex((value) => (value - 1 + visible.length) % visible.length);
  }, [visible.length]);
  const goNext = useCallback(() => {
    setIndex((value) => (value + 1) % visible.length);
  }, [visible.length]);
  const pageThumbsPrev = useCallback(() => {
    setIndex(Math.max(0, thumbPage - 1) * THUMBS_PER_PAGE);
  }, [thumbPage]);
  const pageThumbsNext = useCallback(() => {
    setIndex(Math.min(thumbPageCount - 1, thumbPage + 1) * THUMBS_PER_PAGE);
  }, [thumbPage, thumbPageCount]);

  useEffect(() => {
    if (!lightbox || !current || isPlaceholder(current)) return;
    if (sharp[current.id]) return;
    const src = photoUrl(current, 1600);
    if (!src) return;
    let cancel = false;
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => {
      if (!cancel) setSharp((prev) => (prev[current.id] ? prev : { ...prev, [current.id]: true }));
    };
    img.src = src;
    return () => {
      cancel = true;
    };
  }, [lightbox, current, sharp]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft" && many) goPrev();
      if (event.key === "ArrowRight" && many) goNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, many, goPrev, goNext]);

  const mounted = warmIndexes(safeIndex, visible.length);
  mounted.add(displayIndex);

  return (
    <div>
      {!shown ? (
        <div className="flex min-h-52 items-center justify-center overflow-hidden border border-line bg-black">
          <MediaSlot label={text.mediaCover} hint={text.photoNone} />
        </div>
      ) : (
        <figure className="-mx-4 overflow-hidden border border-line bg-white sm:mx-0">
          <div className={`relative flex items-center justify-center bg-black ${GUTTER}`}>
            {[...mounted].map((photoIndex) => (
              <StagePhoto
                key={visible[photoIndex].id}
                photo={visible[photoIndex]}
                lang={lang}
                field={field}
                visible={photoIndex === displayIndex}
                priority={photoIndex === safeIndex ? "high" : ringDistance(photoIndex, safeIndex, visible.length) === 1 ? "auto" : "low"}
                onReady={markReady}
              />
            ))}
            <button
              type="button"
              className="absolute inset-y-0 left-10 right-10 z-[5] bg-transparent sm:left-14 sm:right-14"
              aria-label={text.photos}
              onClick={() => setLightbox(true)}
            />
            {many ? (
              <>
                <FlipButton side="left" label="previous" onClick={goPrev} />
                <FlipButton side="right" label="next" onClick={goNext} />
              </>
            ) : null}
            {many ? (
              <button
                type="button"
                className="absolute top-2 left-1/2 z-20 -translate-x-1/2 rounded bg-black/55 px-2.5 py-1 text-xs font-medium text-white"
                onClick={() => setLightbox(true)}
              >
                {text.photos}
              </button>
            ) : null}
          </div>
          {many ? (
            <figcaption className="px-3 py-2 text-right text-sm tabular-nums text-muted">
              {safeIndex + 1} / {visible.length}
            </figcaption>
          ) : null}
        </figure>
      )}

      {many ? (
        <div className="mt-3">
          <div className="grid grid-cols-6 gap-2">
            {pageThumbs.map((photo, offset) => {
              const photoIndex = thumbPage * THUMBS_PER_PAGE + offset;
              const thumb = photoUrl(photo, 320);
              return (
                <button
                  key={photo.id}
                  type="button"
                  className={`overflow-hidden rounded border ${photo.id === current?.id ? "border-primary" : "border-line"}`}
                  onClick={() => setIndex(photoIndex)}
                >
                  {isPlaceholder(photo) ? (
                    <span className="flex aspect-[16/10] items-center justify-center bg-[#f3f5f8] text-xs font-semibold text-muted">
                      {photoIndex + 1}
                    </span>
                  ) : thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" decoding="async" fetchPriority="low" />
                  ) : null}
                </button>
              );
            })}
          </div>
          {canPageThumbs ? (
            <div className="mt-2 flex items-center justify-center gap-1 text-sm text-muted">
              <button
                type="button"
                className="px-2 py-1 disabled:opacity-30"
                onClick={pageThumbsPrev}
                disabled={thumbPage <= 0}
                aria-label="previous thumbnails"
              >
                ‹
              </button>
              <span className="min-w-[5.5rem] text-center tabular-nums">
                {thumbPage * THUMBS_PER_PAGE + 1}–{Math.min((thumbPage + 1) * THUMBS_PER_PAGE, visible.length)} / {visible.length}
              </span>
              <button
                type="button"
                className="px-2 py-1 disabled:opacity-30"
                onClick={pageThumbsNext}
                disabled={thumbPage >= thumbPageCount - 1}
                aria-label="next thumbnails"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {lightbox && shown ? (
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
              <FlipButton
                side="left"
                label="previous"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrev();
                }}
              />
              <FlipButton
                side="right"
                label="next"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
              />
            </>
          ) : null}
          <LightboxPhoto
            photo={displayIndex === safeIndex && current && sharp[current.id] ? current : shown}
            width={displayIndex === safeIndex && current && sharp[current.id] ? 1600 : STAGE_WIDTH}
            field={field}
          />
        </div>
      ) : null}
    </div>
  );
}

function isPlaceholder(photo: VehiclePhoto) {
  return photo.placeholder && !photo.path;
}

function StagePhoto({
  photo,
  lang,
  field,
  visible,
  priority,
  onReady,
}: {
  photo: VehiclePhoto;
  lang: Lang;
  field: "ko" | "en";
  visible: boolean;
  priority: "high" | "low" | "auto";
  onReady: (id: string) => void;
}) {
  const text = copy(lang);
  if (isPlaceholder(photo)) {
    return visible ? <MediaSlot label={photoLabel(photo.category, lang)} hint={text.mediaCoverHint} /> : null;
  }
  const src = photoUrl(photo, STAGE_WIDTH);
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={visible ? (field === "ko" ? photo.altKo : photo.altEn) : ""}
      className={
        visible
          ? "relative z-0 block h-auto max-h-[85vh] w-auto max-w-full"
          : "pointer-events-none absolute inset-y-0 left-10 right-10 z-0 mx-auto h-full max-w-[calc(100%-5rem)] object-contain opacity-0 sm:left-14 sm:right-14 sm:max-w-[calc(100%-7rem)]"
      }
      decoding="async"
      fetchPriority={priority}
      ref={(element) => {
        if (element?.complete && element.naturalWidth > 0) onReady(photo.id);
      }}
      onLoad={() => onReady(photo.id)}
    />
  );
}

function FlipButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      className={`absolute inset-y-0 z-10 flex w-10 items-center justify-center text-white sm:w-14 ${side === "left" ? "left-0" : "right-0"}`}
      aria-label={label}
      onClick={onClick}
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-white/20">
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          <path
            d={side === "left" ? "M14.5 5.5 8 12l6.5 6.5" : "M9.5 5.5 16 12l-6.5 6.5"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

function LightboxPhoto({ photo, width, field }: { photo: VehiclePhoto; width: 1200 | 1600; field: "ko" | "en" }) {
  if (isPlaceholder(photo)) return null;
  const src = photoUrl(photo, width);
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={field === "ko" ? photo.altKo : photo.altEn}
      className="pointer-events-none relative z-0 max-h-[90vh] max-w-full object-contain"
      decoding="async"
    />
  );
}
