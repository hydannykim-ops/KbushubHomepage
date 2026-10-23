"use client";

import { useMemo, useState } from "react";
import { MediaSlot } from "@/components/media-slot";
import type { Lang, PhotoCategory, VehiclePhoto } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { contentFieldLang } from "@/lib/i18n/langs";
import { photoCategoryList, photoLabel } from "@/lib/labels";

const categories: Array<PhotoCategory | "all"> = ["all", ...photoCategoryList];

export function GalleryClient({ photos, lang }: { photos: VehiclePhoto[]; lang: Lang }) {
  const text = copy(lang);
  const [category, setCategory] = useState<PhotoCategory | "all">("all");
  const visible = useMemo(
    () => photos.filter((photo) => category === "all" || photo.category === category).sort((a, b) => a.sortOrder - b.sortOrder),
    [photos, category],
  );
  const [index, setIndex] = useState(0);
  const current = visible[Math.min(index, Math.max(visible.length - 1, 0))];

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
      {!current ? (
        <div className="aspect-[16/10] overflow-hidden border border-line bg-white">
          <MediaSlot label={text.mediaCover} hint={text.photoNone} />
        </div>
      ) : (
        <figure className="overflow-hidden border border-line bg-white">
          <div className="relative aspect-[16/10] bg-[#f3f5f8]">
            {current.placeholder && current.path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.path} alt={contentFieldLang(lang) === "ko" ? current.altKo : current.altEn} className="h-full w-full object-cover" />
            ) : current.placeholder ? (
              <MediaSlot label={photoLabel(current.category, lang)} hint={text.mediaCoverHint} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/media/photo/${current.id}`} alt={contentFieldLang(lang) === "ko" ? current.altKo : current.altEn} className="h-full w-full object-cover" />
            )}
          </div>
          <figcaption className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-muted">
            <span>{photoLabel(current.category, lang)}</span>
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
                <span className="flex aspect-[16/10] items-center justify-center bg-[#f3f5f8] px-1 text-center text-xs font-semibold text-foreground">{photoLabel(photo.category, lang)}</span>
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
