"use client";

import { useMemo, useState } from "react";
import { MediaSlot } from "@/components/media-slot";
import type { Lang, VehiclePhoto } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";

export function GalleryClient({ photos, lang }: { photos: VehiclePhoto[]; lang: Lang }) {
  const text = copy(lang);
  const visible = useMemo(() => [...photos].sort((a, b) => a.sortOrder - b.sortOrder), [photos]);
  const [index, setIndex] = useState(0);
  const current = visible[Math.min(index, Math.max(visible.length - 1, 0))];

  return (
    <div>
      {!current ? (
        <div className="aspect-[16/10] overflow-hidden border border-line bg-white">
          <MediaSlot label={text.mediaCover} hint={text.photoNone} />
        </div>
      ) : (
        <figure className="overflow-hidden border border-line bg-white">
          <div className="relative aspect-[16/10] bg-[#f3f5f8]">
            {current.placeholder && current.path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.path} alt={contentFieldLang(lang) === "ko" ? current.altKo : current.altEn} className="pointer-events-none h-full w-full object-cover" />
            ) : current.placeholder ? (
              <MediaSlot label={text.mediaCover} hint={text.mediaCoverHint} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/media/photo/${current.id}`}
                alt={contentFieldLang(lang) === "ko" ? current.altKo : current.altEn}
                className="pointer-events-none h-full w-full object-cover"
              />
            )}
            {visible.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer bg-transparent"
                  aria-label="previous"
                  onClick={() => setIndex((value) => (value - 1 + visible.length) % visible.length)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer bg-transparent"
                  aria-label="next"
                  onClick={() => setIndex((value) => (value + 1) % visible.length)}
                />
              </>
            ) : null}
          </div>
          {visible.length > 1 ? (
            <figcaption className="flex items-center justify-end gap-3 px-3 py-2 text-sm text-muted">
              <span>
                <button type="button" className="px-2" onClick={() => setIndex((value) => (value - 1 + visible.length) % visible.length)} aria-label="previous">
                  ‹
                </button>
                {Math.min(index, visible.length - 1) + 1} / {visible.length}
                <button type="button" className="px-2" onClick={() => setIndex((value) => (value + 1) % visible.length)} aria-label="next">
                  ›
                </button>
              </span>
            </figcaption>
          ) : null}
        </figure>
      )}
      {visible.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {visible.map((photo, photoIndex) => (
            <button
              key={photo.id}
              type="button"
              className={`overflow-hidden rounded border ${photo.id === current?.id ? "border-primary" : "border-line"}`}
              onClick={() => setIndex(photoIndex)}
            >
              {photo.placeholder && photo.path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.path} alt="" className="aspect-[16/10] w-full object-cover" />
              ) : photo.placeholder ? (
                <span className="flex aspect-[16/10] items-center justify-center bg-[#f3f5f8] text-xs font-semibold text-muted">{photoIndex + 1}</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/photo/${photo.id}`} alt="" className="aspect-[16/10] w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
