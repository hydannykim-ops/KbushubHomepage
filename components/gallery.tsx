"use client";

import Image from "next/image";
import { useState } from "react";
import { BusArt } from "@/components/bus-art";
import { textOf } from "@/lib/domain";
import { getDict } from "@/lib/i18n";
import type { Locale, Photo, VehicleClass } from "@/lib/types";

const order = ["exterior", "interior", "dashboard", "engine", "tires", "defect"] as const;

export function Gallery({
  photos,
  lang,
  variant,
}: {
  photos: Photo[];
  lang: Locale;
  variant: VehicleClass;
}) {
  const dict = getDict(lang);
  const [category, setCategory] = useState<string>("all");
  if (!photos.length) {
    return (
      <div className="border border-line">
        <BusArt variant={variant} label={dict.common.photoNone} />
      </div>
    );
  }
  const visible = category === "all" ? photos : photos.filter((photo) => photo.category === category);
  const used = order.filter((item) => photos.some((photo) => photo.category === item));
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={dict.a11y.gallery}>
        <button
          type="button"
          aria-pressed={category === "all"}
          className={`h-9 px-3 text-sm ${category === "all" ? "bg-ink text-white" : "border border-line bg-white"}`}
          onClick={() => setCategory("all")}
        >
          {dict.common.all}
        </button>
        {used.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            className={`h-9 px-3 text-sm ${category === item ? "bg-ink text-white" : "border border-line bg-white"}`}
            onClick={() => setCategory(item)}
          >
            {dict.photo[item]}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {visible.map((photo) => (
          <figure key={photo.id} className="border border-line bg-white">
            {photo.file ? (
              <Image
                src={`/stock/${photo.file}`}
                alt={textOf(photo.alt, lang, dict.photo[photo.category])}
                width={1200}
                height={800}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <BusArt variant={variant} label={dict.common.photoPending} />
            )}
            <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">
              {dict.photo[photo.category]}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
