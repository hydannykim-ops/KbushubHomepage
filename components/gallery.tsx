"use client";

import Image from "next/image";
import { useState } from "react";
import { PhotoFrame } from "@/components/photo-frame";
import { textOf } from "@/lib/domain";
import { getDict } from "@/lib/i18n";
import { chipOff, chipOn } from "@/lib/ui";
import type { Locale, Photo, VehicleClass } from "@/lib/types";

const order = ["exterior", "interior", "dashboard", "engine", "tires", "defect"] as const;

export function Gallery({
  photos,
  lang,
}: {
  photos: Photo[];
  lang: Locale;
  variant: VehicleClass;
}) {
  const dict = getDict(lang);
  const [category, setCategory] = useState<string>("all");
  if (!photos.length) {
    return (
      <div className="overflow-hidden rounded-[1.25rem]">
        <PhotoFrame kicker={dict.common.slotPhoto} caption={dict.common.photoNone} aspect="aspect-[16/10]" />
      </div>
    );
  }
  const visible = category === "all" ? photos : photos.filter((photo) => photo.category === category);
  const used = order.filter((item) => photos.some((photo) => photo.category === item));
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={dict.a11y.gallery}>
        <button type="button" aria-pressed={category === "all"} className={category === "all" ? chipOn : chipOff} onClick={() => setCategory("all")}>
          {dict.common.all}
        </button>
        {used.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            className={category === item ? chipOn : chipOff}
            onClick={() => setCategory(item)}
          >
            {dict.photo[item]}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {visible.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-[1.25rem] bg-card shadow-card">
            {photo.file ? (
              <Image
                src={`/stock/${photo.file}`}
                alt={textOf(photo.alt, lang, dict.photo[photo.category])}
                width={1200}
                height={800}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : (
              <PhotoFrame kicker={dict.common.slotPhoto} caption={`${dict.photo[photo.category]} · ${dict.common.photoPending}`} aspect="aspect-[16/10]" />
            )}
            <figcaption className="px-4 py-3 text-[12px] text-muted">{dict.photo[photo.category]}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
