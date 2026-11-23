"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PHOTO_TAB_FIELD, PHOTO_TABS, type PhotoTab } from "@/lib/domain/photo-categories";
import type { Lang } from "@/lib/domain/types";
import { MAX_SELL_PHOTOS } from "@/lib/domain/uploads";
import { copy } from "@/lib/i18n";
import { photoTabLabel } from "@/lib/labels";

type Item = { file: File; preview: string };

const emptyBuckets = (): Record<PhotoTab, Item[]> => ({
  exterior: [],
  interior: [],
  other: [],
  registration: [],
});

function assignFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}

function revokeAll(buckets: Record<PhotoTab, Item[]>) {
  for (const tab of PHOTO_TABS) {
    for (const item of buckets[tab]) URL.revokeObjectURL(item.preview);
  }
}

export function PhotoSlotUploader({
  lang,
  resetKey = 0,
  optional = false,
}: {
  lang: Lang;
  /** Bump to clear previews after a successful submit. */
  resetKey?: number;
  /** When true, no photo is required. */
  optional?: boolean;
}) {
  const text = copy(lang);
  const [active, setActive] = useState<PhotoTab>("other");
  const [buckets, setBuckets] = useState(emptyBuckets);
  const inputRefs = useRef<Partial<Record<PhotoTab, HTMLInputElement | null>>>({});

  useEffect(() => {
    setBuckets((current) => {
      revokeAll(current);
      return emptyBuckets();
    });
    for (const tab of PHOTO_TABS) assignFiles(inputRefs.current[tab] ?? null, []);
    setActive("other");
  }, [resetKey]);

  useEffect(() => {
    return () => {
      revokeAll(buckets);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, []);

  const filled = useMemo(() => PHOTO_TABS.reduce((sum, tab) => sum + buckets[tab].length, 0), [buckets]);
  const room = Math.max(0, MAX_SELL_PHOTOS - filled);
  const activeItems = buckets[active];

  function onPick(tab: PhotoTab, fileList: FileList | null) {
    const incoming = fileList ? Array.from(fileList) : [];
    setBuckets((current) => {
      const usedElsewhere = PHOTO_TABS.filter((key) => key !== tab).reduce((sum, key) => sum + current[key].length, 0);
      const limit = Math.max(0, MAX_SELL_PHOTOS - usedElsewhere);
      for (const item of current[tab]) URL.revokeObjectURL(item.preview);
      const nextItems = incoming.slice(0, limit).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      assignFiles(inputRefs.current[tab] ?? null, nextItems.map((item) => item.file));
      return { ...current, [tab]: nextItems };
    });
  }

  function clearItem(tab: PhotoTab, index: number) {
    setBuckets((current) => {
      const removed = current[tab][index];
      if (removed) URL.revokeObjectURL(removed.preview);
      const nextItems = current[tab].filter((_, i) => i !== index);
      assignFiles(inputRefs.current[tab] ?? null, nextItems.map((item) => item.file));
      return { ...current, [tab]: nextItems };
    });
  }

  return (
    <div className="grid gap-3">
      <div className="border border-line bg-[#f7f9fb] px-3 py-3 text-sm leading-6 text-muted">
        <p className="font-semibold text-ink">{optional ? text.sellPhotoOptionalTitle : text.photos}</p>
        <p className="mt-1">
          {lang === "ko"
            ? "탭을 고른 뒤 사진을 올리세요. 기본 탭은 기타라서 한 번에 올리면 기타로 들어갑니다."
            : "Pick a tab, then upload. Default tab is Other, so bulk picks land there."}
        </p>
        <p className="mt-2 font-medium text-ink">
          {filled}/{MAX_SELL_PHOTOS}
          {!optional ? (lang === "ko" ? " · 1장 이상 권장" : " · at least 1 recommended") : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PHOTO_TABS.map((tab) => {
          const count = buckets[tab].length;
          const selected = tab === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                selected ? "bg-primary text-white" : "border border-line bg-white text-ink"
              }`}
            >
              {photoTabLabel(tab, lang)}
              {count ? ` ${count}` : ""}
            </button>
          );
        })}
      </div>

      {/* Always mounted so FormData keeps every category on submit. */}
      {PHOTO_TABS.map((tab) => (
        <input
          key={tab}
          ref={(node) => {
            inputRefs.current[tab] = node;
          }}
          name={PHOTO_TAB_FIELD[tab]}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => onPick(tab, event.target.files)}
        />
      ))}

      <div className="grid gap-2 border border-line bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{photoTabLabel(active, lang)}</p>
          <span className="text-xs text-muted">
            {activeItems.length}
            {room ? ` · +${room}` : ""}
          </span>
        </div>
        <button
          type="button"
          className="relative flex min-h-28 items-center justify-center overflow-hidden border border-dashed border-line bg-[#eef2f6] px-3 py-6 text-center text-xs text-muted"
          onClick={() => inputRefs.current[active]?.click()}
        >
          {lang === "ko" ? "눌러서 여러 장 선택" : "Tap to add multiple photos"}
        </button>

        {activeItems.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {activeItems.map((item, index) => (
              <div key={`${item.file.name}-${item.file.size}-${index}`} className="relative overflow-hidden border border-line bg-[#f7f9fb]">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={item.preview} alt="" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink"
                  onClick={() => clearItem(active, index)}
                >
                  {text.photoClear}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
