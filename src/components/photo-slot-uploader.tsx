"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/domain/types";
import { PHOTO_SLOTS, type PhotoSlotId } from "@/lib/domain/photo-slots";
import { MAX_EXTRA_PHOTOS } from "@/lib/domain/uploads";
import { copy } from "@/lib/i18n";

type SlotState = { file: File | null; preview: string | null };
type ExtraItem = { file: File; preview: string };

const emptySlots = (): Record<PhotoSlotId, SlotState> =>
  Object.fromEntries(PHOTO_SLOTS.map((slot) => [slot.id, { file: null, preview: null }])) as Record<PhotoSlotId, SlotState>;

function assignFiles(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}

export function PhotoSlotUploader({
  lang,
  resetKey = 0,
}: {
  lang: Lang;
  /** Bump to clear previews after a successful submit. */
  resetKey?: number;
}) {
  const text = copy(lang);
  const [slots, setSlots] = useState(emptySlots);
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const extraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSlots((current) => {
      for (const slot of Object.values(current)) {
        if (slot.preview) URL.revokeObjectURL(slot.preview);
      }
      return emptySlots();
    });
    setExtras((current) => {
      for (const item of current) URL.revokeObjectURL(item.preview);
      return [];
    });
    assignFiles(extraInputRef.current, []);
  }, [resetKey]);

  useEffect(() => {
    return () => {
      for (const slot of Object.values(slots)) {
        if (slot.preview) URL.revokeObjectURL(slot.preview);
      }
      for (const item of extras) URL.revokeObjectURL(item.preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, []);

  const filled = useMemo(() => PHOTO_SLOTS.filter((slot) => slots[slot.id].file).length + extras.length, [slots, extras]);
  const requiredFilled = PHOTO_SLOTS.filter((slot) => slot.required && slots[slot.id].file).length;
  const requiredTotal = PHOTO_SLOTS.filter((slot) => slot.required).length;

  function onPick(id: PhotoSlotId, fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    setSlots((current) => {
      const previous = current[id];
      if (previous.preview) URL.revokeObjectURL(previous.preview);
      return {
        ...current,
        [id]: {
          file,
          preview: file ? URL.createObjectURL(file) : null,
        },
      };
    });
  }

  function clearSlot(id: PhotoSlotId) {
    setSlots((current) => {
      const previous = current[id];
      if (previous.preview) URL.revokeObjectURL(previous.preview);
      return { ...current, [id]: { file: null, preview: null } };
    });
  }

  function onExtraPick(fileList: FileList | null) {
    const incoming = fileList ? Array.from(fileList) : [];
    setExtras((current) => {
      for (const item of current) URL.revokeObjectURL(item.preview);
      const next = incoming.slice(0, MAX_EXTRA_PHOTOS).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      assignFiles(extraInputRef.current, next.map((item) => item.file));
      return next;
    });
  }

  function clearExtra(index: number) {
    setExtras((current) => {
      const next = current.filter((_, i) => i !== index);
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      assignFiles(extraInputRef.current, next.map((item) => item.file));
      return next;
    });
  }

  const labels: Record<PhotoSlotId, { title: string; hint: string }> = {
    front: { title: text.photoFront, hint: text.photoHintFront },
    left: { title: text.photoLeft, hint: text.photoHintLeft },
    right: { title: text.photoRight, hint: text.photoHintRight },
    rear: { title: text.photoRear, hint: text.photoHintRear },
    interior: { title: text.photoInterior, hint: text.photoHintInterior },
    dashboard: { title: text.photoDashboard, hint: text.photoHintDashboard },
    wheel1: { title: text.photoWheel1, hint: text.photoHintWheel },
    wheel2: { title: text.photoWheel2, hint: text.photoHintWheel },
    wheel3: { title: text.photoWheel3, hint: text.photoHintWheel },
    wheel4: { title: text.photoWheel4, hint: text.photoHintWheel },
  };

  return (
    <div className="grid gap-4">
      <div className="border border-line bg-[#f7f9fb] px-3 py-3 text-sm leading-6 text-muted">
        <p className="font-semibold text-ink">{text.photoGuideTitle}</p>
        <p className="mt-1">{text.photoGuideBody}</p>
        <p className="mt-2 font-medium text-ink">
          {text.photoProgress
            .replace("{filled}", String(filled))
            .replace("{total}", String(PHOTO_SLOTS.length + MAX_EXTRA_PHOTOS))
            .replace("{required}", String(requiredFilled))
            .replace("{requiredTotal}", String(requiredTotal))}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PHOTO_SLOTS.map((slot) => {
          const state = slots[slot.id];
          const meta = labels[slot.id];
          return (
            <div
              key={slot.id}
              className={`grid min-w-0 gap-2 overflow-hidden border p-3 ${state.file ? "border-primary bg-[#f3f7fc]" : "border-line bg-white"}`}
            >
              <div className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">
                <span>
                  {meta.title}
                  {slot.required ? <span className="text-primary"> *</span> : null}
                </span>
                {state.file ? (
                  <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">{text.photoSelected}</span>
                ) : (
                  <span className="text-[11px] font-medium text-muted">{text.photoEmpty}</span>
                )}
              </div>
              <p className="text-xs leading-5 text-muted">{meta.hint}</p>
              <label className="relative aspect-[4/3] w-full max-w-full cursor-pointer overflow-hidden border border-dashed border-line bg-[#eef2f6]">
                {state.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                  <img
                    src={state.preview}
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full max-w-full object-contain object-center"
                  />
                ) : (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-muted">
                    {text.photoTapToAdd}
                  </span>
                )}
                <input
                  key={`${slot.id}-${state.file ? `${state.file.name}-${state.file.size}` : "empty"}`}
                  name={slot.field}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={slot.required}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={(event) => onPick(slot.id, event.target.files)}
                />
              </label>
              {state.file ? (
                <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-muted">
                  <span className="truncate">{state.file.name}</span>
                  <button type="button" className="shrink-0 font-semibold text-ink underline" onClick={() => clearSlot(slot.id)}>
                    {text.photoClear}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-2 border border-line bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{text.photoExtra}</p>
          <span className="text-xs text-muted">
            {extras.length}/{MAX_EXTRA_PHOTOS}
          </span>
        </div>
        <p className="text-xs leading-5 text-muted">{text.photoExtraHint}</p>
        <label className="relative flex min-h-28 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-line bg-[#eef2f6] px-3 py-6 text-center text-xs text-muted">
          {extras.length ? text.photoSelected : text.photoTapToAdd}
          <input
            ref={extraInputRef}
            name="extra"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => onExtraPick(event.target.files)}
          />
        </label>
        {extras.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {extras.map((item, index) => (
              <div key={`${item.file.name}-${item.file.size}-${index}`} className="relative overflow-hidden border border-line bg-[#f7f9fb]">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={item.preview} alt="" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink"
                  onClick={() => clearExtra(index)}
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
