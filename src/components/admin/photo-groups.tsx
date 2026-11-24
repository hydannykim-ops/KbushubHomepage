"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminPhotoBatches } from "@/lib/domain/admin-photo-batches";
import { compressImageFile } from "@/lib/domain/compress-image-client";
import { PHOTO_TABS, type PhotoTab } from "@/lib/domain/photo-categories";
import { MAX_VEHICLE_PHOTOS } from "@/lib/domain/uploads";

const LABELS: Record<PhotoTab, string> = {
  exterior: "외부",
  interior: "내부",
  other: "기타",
  registration: "등록증",
};

const HINTS: Record<PhotoTab, string> = {
  exterior: "정면·측면·후면",
  interior: "좌석·운전석·계기판",
  other: "엔진룸·타이어·그 외",
  registration: "자동차등록증",
};

type Item = { id: string; file: File; preview: string };

export type AdminGroupedPhoto = { file: File; category: PhotoTab };

export type AdminPhotoGroupsHandle = {
  files: () => AdminGroupedPhoto[];
  count: () => number;
  clear: () => void;
};

function emptyBuckets(): Record<PhotoTab, Item[]> {
  return { exterior: [], interior: [], other: [], registration: [] };
}

function revokeBuckets(buckets: Record<PhotoTab, Item[]>) {
  for (const tab of PHOTO_TABS) {
    for (const item of buckets[tab]) URL.revokeObjectURL(item.preview);
  }
}

export async function uploadAdminPhotos(
  vehicleId: string,
  photos: AdminGroupedPhoto[],
  sortBaseStart: number,
  onProgress?: (message: string) => void,
): Promise<{ ok: true; count: number } | { ok: false; code: string }> {
  const grouped: Record<PhotoTab, AdminGroupedPhoto[]> = {
    exterior: [],
    interior: [],
    other: [],
    registration: [],
  };
  for (const photo of photos) grouped[photo.category].push(photo);
  const batches = adminPhotoBatches(grouped, 8, sortBaseStart);
  let uploaded = 0;
  for (const batch of batches) {
    onProgress?.(`사진 업로드 중… ${uploaded}/${photos.length}`);
    const form = new FormData();
    form.set("sortBase", String(batch.sortBase));
    form.set("category", batch.category);
    for (const item of batch.items) form.append("files", item.file, item.file.name);
    const response = await fetch(`/api/admin/vehicles/${vehicleId}/photos/batch`, {
      method: "POST",
      body: form,
      headers: { accept: "application/json" },
    });
    const body = (await response.json()) as { ok?: boolean; code?: string; count?: number };
    if (!response.ok || !body.ok) return { ok: false, code: body.code || "photo_upload_failed" };
    uploaded += body.count ?? batch.items.length;
  }
  if (photos.length) onProgress?.(`사진 ${uploaded}장 업로드 완료`);
  return { ok: true, count: uploaded };
}

export const AdminPhotoGroups = forwardRef<AdminPhotoGroupsHandle, { max?: number; disabled?: boolean; markCover?: boolean }>(function AdminPhotoGroups(
  { max = MAX_VEHICLE_PHOTOS, disabled = false, markCover = true },
  ref,
) {
  const [buckets, setBuckets] = useState(emptyBuckets);
  const [activeDrag, setActiveDrag] = useState<PhotoTab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const bucketsRef = useRef(buckets);
  const dragDepth = useRef(0);
  bucketsRef.current = buckets;
  const inputRefs = useRef<Partial<Record<PhotoTab, HTMLInputElement | null>>>({});

  useEffect(() => {
    return () => revokeBuckets(bucketsRef.current);
  }, []);

  const total = PHOTO_TABS.reduce((sum, tab) => sum + buckets[tab].length, 0);
  const coverId = PHOTO_TABS.flatMap((tab) => buckets[tab])[0]?.id;

  useImperativeHandle(ref, () => ({
    files: () => PHOTO_TABS.flatMap((tab) => bucketsRef.current[tab].map((item) => ({ file: item.file, category: tab }))),
    count: () => PHOTO_TABS.reduce((sum, tab) => sum + bucketsRef.current[tab].length, 0),
    clear: () => {
      setBuckets((current) => {
        revokeBuckets(current);
        return emptyBuckets();
      });
      setError(null);
      setProgress(null);
    },
  }));

  async function onPick(tab: PhotoTab, fileList: FileList | File[] | null) {
    if (disabled || !fileList?.length) return;
    const incoming = Array.from(fileList).filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name));
    if (!incoming.length) {
      setError("이미지 파일(JPEG/PNG/WebP)만 올릴 수 있습니다.");
      return;
    }
    const room = max - PHOTO_TABS.reduce((sum, key) => sum + bucketsRef.current[key].length, 0);
    if (room <= 0) {
      setError(`사진은 최대 ${max}장까지입니다.`);
      return;
    }
    const sliced = incoming.slice(0, room);
    setProgress(`사진 압축 중… 0/${sliced.length}`);
    const next: Item[] = [];
    for (let index = 0; index < sliced.length; index += 1) {
      const compressed = await compressImageFile(sliced[index]);
      next.push({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        file: compressed,
        preview: URL.createObjectURL(compressed),
      });
      setProgress(`사진 압축 중… ${index + 1}/${sliced.length}`);
    }
    setBuckets((current) => ({ ...current, [tab]: [...current[tab], ...next] }));
    setProgress(null);
    if (incoming.length > room) setError(`최대 ${max}장만 올립니다. 초과분은 제외했습니다.`);
    else setError(null);
  }

  function move(tab: PhotoTab, index: number, delta: number) {
    setBuckets((current) => {
      const target = index + delta;
      if (target < 0 || target >= current[tab].length) return current;
      const copy = [...current[tab]];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return { ...current, [tab]: copy };
    });
  }

  function remove(tab: PhotoTab, id: string) {
    setBuckets((current) => {
      const found = current[tab].find((item) => item.id === id);
      if (found) URL.revokeObjectURL(found.preview);
      return { ...current, [tab]: current[tab].filter((item) => item.id !== id) };
    });
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-muted">
          외부, 내부, 기타, 등록증 칸에 나눠 올리세요.
          {markCover ? " 대표 사진은 외부 첫 장이고, 외부가 없으면 처음 올린 사진입니다." : " 이미 있는 대표 사진은 그대로 둡니다."}
        </p>
        <p className="text-sm font-semibold tabular-nums">
          {total}/{max}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {PHOTO_TABS.map((tab) => {
          const items = buckets[tab];
          const dragging = activeDrag === tab;
          return (
            <section key={tab} className="grid gap-2 rounded-md border border-line bg-[#f8f8f6] p-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{LABELS[tab]}</h3>
                <span className="text-xs text-muted">
                  {HINTS[tab]} · {items.length}장
                </span>
              </div>
              <input
                ref={(node) => {
                  inputRefs.current[tab] = node;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                aria-label={`${LABELS[tab]} 사진 선택`}
                disabled={disabled || total >= max}
                onChange={(event) => {
                  void onPick(tab, event.target.files);
                  event.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                disabled={disabled || total >= max}
                onClick={() => inputRefs.current[tab]?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  dragDepth.current += 1;
                  if (event.dataTransfer.types.includes("Files")) setActiveDrag(tab);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (event.dataTransfer.types.includes("Files")) {
                    event.dataTransfer.dropEffect = "copy";
                    setActiveDrag(tab);
                  }
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  dragDepth.current = Math.max(0, dragDepth.current - 1);
                  if (dragDepth.current === 0) setActiveDrag((current) => (current === tab ? null : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  dragDepth.current = 0;
                  setActiveDrag(null);
                  void onPick(tab, event.dataTransfer.files);
                }}
                className={`grid min-h-24 place-items-center rounded-md border-2 border-dashed px-3 py-4 text-center text-sm disabled:opacity-60 ${
                  dragging ? "border-primary bg-[#eef3fb]" : "border-line bg-white hover:border-primary/50"
                }`}
              >
                <span className="font-semibold text-ink">{dragging ? "이 칸에 놓기" : `${LABELS[tab]} 사진 선택`}</span>
              </button>
              {items.length ? (
                <ol className="grid grid-cols-2 gap-2">
                  {items.map((item, index) => (
                    <li key={item.id} className="overflow-hidden rounded-md border border-line bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.preview} alt="" className="aspect-[4/3] w-full object-cover" />
                      <div className="flex items-center justify-between gap-1 px-1.5 py-1 text-xs">
                        <span className="font-semibold tabular-nums">
                          {index + 1}
                          {markCover && item.id === coverId ? " · 대표" : ""}
                        </span>
                        <span className="flex gap-1">
                          <button type="button" className="rounded border border-line px-1.5 py-0.5" onClick={() => move(tab, index, -1)} disabled={index === 0}>
                            ↑
                          </button>
                          <button
                            type="button"
                            className="rounded border border-line px-1.5 py-0.5"
                            onClick={() => move(tab, index, 1)}
                            disabled={index === items.length - 1}
                          >
                            ↓
                          </button>
                          <button type="button" className="rounded border border-line px-1.5 py-0.5 text-[#9f1239]" onClick={() => remove(tab, item.id)}>
                            삭제
                          </button>
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          );
        })}
      </div>
      {progress ? <p className="text-sm text-muted">{progress}</p> : null}
      {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}
    </div>
  );
});

const uploadErrorLabel: Record<string, string> = {
  photo_required: "사진 파일을 선택해 주세요.",
  too_many_photos: `사진은 최대 ${MAX_VEHICLE_PHOTOS}장까지 올릴 수 있습니다.`,
  invalid_image: "이미지 파일을 열 수 없습니다.",
  unauthorized: "다시 로그인해 주세요.",
  photo_upload_failed: "사진을 올리지 못했습니다.",
};

export function AdminPhotoAppender({ vehicleId, existingCount }: { vehicleId: string; existingCount: number }) {
  const router = useRouter();
  const ref = useRef<AdminPhotoGroupsHandle>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const room = Math.max(0, MAX_VEHICLE_PHOTOS - existingCount);

  async function upload() {
    const photos = ref.current?.files() ?? [];
    if (!photos.length) {
      setError("올릴 사진을 칸에 넣어 주세요.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await uploadAdminPhotos(vehicleId, photos, existingCount, setProgress);
      if (!result.ok) {
        setError(uploadErrorLabel[result.code] ?? "사진을 올리지 못했습니다.");
        return;
      }
      ref.current?.clear();
      setProgress(`사진 ${result.count}장을 올렸습니다.`);
      router.refresh();
    } catch {
      setError("사진을 올리지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5 grid gap-3 border-t border-line pt-4">
      <h3 className="font-semibold">사진 추가</h3>
      {room === 0 ? (
        <p className="text-sm text-muted">사진은 최대 {MAX_VEHICLE_PHOTOS}장까지입니다.</p>
      ) : (
        <>
          <AdminPhotoGroups ref={ref} max={room} disabled={pending} markCover={existingCount === 0} />
          <button
            type="button"
            disabled={pending}
            onClick={() => void upload()}
            className="justify-self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "올리는 중…" : "선택한 사진 올리기"}
          </button>
        </>
      )}
      {progress ? <p className="text-sm text-muted">{progress}</p> : null}
      {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}
    </div>
  );
}
