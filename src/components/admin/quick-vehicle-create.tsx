"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPhotoGroups, uploadAdminPhotos, type AdminPhotoGroupsHandle } from "@/components/admin/photo-groups";
import { notifyAdminSaved } from "@/components/admin/saved-toast";
import { MakerModelPicker } from "@/components/maker-model-picker";
import { parseListingPaste, suggestAdminStockNo, type ListingPasteDraft } from "@/lib/domain/listing-paste";
import { standardForModel } from "@/lib/domain/model-specs";
import { classForModel, makerForModel } from "@/lib/domain/vehicle-catalog";
import type { Fuel, Steering, TransferType, Transmission, VehicleClass } from "@/lib/domain/types";

const field = "rounded-md border border-line px-3 py-2 text-sm font-normal";

function Label({ text, children, className = "" }: { text: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`grid gap-1 text-sm font-medium ${className}`}>
      {text}
      {children}
    </label>
  );
}

function transferFromUse(use: string | null): TransferType {
  const text = use ?? "";
  if (text.includes("대폐")) return "scrap_replace";
  if (text.includes("수출") || text.includes("자가용")) return "private_export";
  if (text.includes("양도")) return "transfer";
  return "transfer";
}

function emptyDraft(): ListingPasteDraft {
  return {
    maker: "",
    model: "",
    vehicleClass: "large",
    modelYear: null,
    modelMonth: null,
    mileageKm: null,
    previousUseKo: null,
    phone: null,
    descriptionKo: null,
    seats: null,
    horsepowerPs: null,
    transmission: "unknown",
    fuel: "unknown",
    engineModel: null,
    displacementCc: null,
    steering: "unknown",
    longBody: null,
    warnings: [],
  };
}

export function QuickVehicleCreate() {
  const router = useRouter();
  const [paste, setPaste] = useState(
    "● 차명 :유니버스 노블\n● 년식 :13년식\n● 거리 : 670,000KM\n● 기타 :자가용/수출용\n● 전화문의 바랍니다.010-0000-0000",
  );
  const [draft, setDraft] = useState<ListingPasteDraft>(emptyDraft);
  const [stockNo, setStockNo] = useState(() => suggestAdminStockNo(null));
  const [status, setStatus] = useState("available");
  const [transferType, setTransferType] = useState<TransferType>("transfer");
  const [pickerKey, setPickerKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const photoRef = useRef<AdminPhotoGroupsHandle>(null);

  function applyPaste() {
    const next = parseListingPaste(paste);
    setDraft(next);
    setTransferType(transferFromUse(next.previousUseKo));
    setStockNo(suggestAdminStockNo(next.modelYear));
    setPickerKey((value) => value + 1);
    setError(null);
  }

  function applyModel(model: string) {
    const standard = standardForModel(model);
    const nextClass = classForModel(model);
    const nextMaker = makerForModel(model);
    setDraft((current) => ({
      ...current,
      maker: nextMaker || current.maker,
      model,
      vehicleClass: nextClass ?? current.vehicleClass,
      seats: standard?.seats ?? current.seats,
      horsepowerPs: standard?.horsepowerPs ?? current.horsepowerPs,
      transmission: standard?.transmission ?? current.transmission,
      fuel: standard?.fuel ?? current.fuel,
      engineModel: standard?.engineModel ?? current.engineModel,
      displacementCc: standard?.displacementCc ?? current.displacementCc,
      steering: standard?.steering ?? current.steering,
      longBody: standard?.longBody ?? current.longBody,
      warnings: current.warnings.filter((item) => !item.includes("차명")),
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!draft.maker || !draft.model) {
      setError("제조사와 모델을 선택해 주세요. 위 문구를 자동 채운 뒤 확인해 주세요.");
      return;
    }
    if (!stockNo.trim()) {
      setError("매물번호를 입력해 주세요.");
      return;
    }
    setPending(true);
    setProgress("매물 저장 중…");
    const payload = {
      stockNo: stockNo.trim(),
      status,
      vehicleClass: draft.vehicleClass,
      maker: draft.maker,
      model: draft.model,
      trim: "",
      modelYear: draft.modelYear == null ? "" : String(draft.modelYear),
      modelMonth: draft.modelMonth == null ? "" : String(draft.modelMonth),
      firstRegisteredOn: "",
      mileageKm: draft.mileageKm == null ? "" : String(draft.mileageKm),
      seats: draft.seats == null ? "" : String(draft.seats),
      horsepowerPs: draft.horsepowerPs == null ? "" : String(draft.horsepowerPs),
      transmission: draft.transmission,
      fuel: draft.fuel,
      engineModel: draft.engineModel ?? "",
      displacementCc: draft.displacementCc == null ? "" : String(draft.displacementCc),
      steering: draft.steering,
      longBody: draft.longBody == null ? "" : String(draft.longBody),
      transferType,
      lengthMm: "",
      widthMm: "",
      heightMm: "",
      previousUseKo: draft.previousUseKo ?? "",
      previousUseEn: "",
      location: "",
      maintenanceKo: "",
      maintenanceEn: "",
      defectsKo: "",
      defectsEn: "",
      descriptionKo: draft.descriptionKo ?? "",
      descriptionEn: "",
      photographedOn: "",
      stockCheckedOn: "",
      featured: false,
      domesticPriceKrw: "",
      exportPriceAmount: "",
      exportPriceCurrency: "",
      exportPriceTermsKo: "",
      exportPriceTermsEn: "",
      videoUrl: "",
      internal: {
        purchaseCost: "",
        purchaseCurrency: "",
        actualSaleAmount: "",
        saleCurrency: "",
        extraCosts: "",
        agentFee: "",
        feeCurrency: "",
        note: draft.phone ? `문의전화 ${draft.phone}` : "",
      },
    };

    try {
      const created = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const createdBody = (await created.json()) as { ok?: boolean; id?: string; code?: string; errors?: Record<string, string> };
      if (!created.ok || !createdBody.ok || !createdBody.id) {
        setError(createdBody.errors ? Object.values(createdBody.errors).join(" ") : createdBody.code || "save_failed");
        return;
      }

      const photos = photoRef.current?.files() ?? [];
      if (photos.length) {
        const uploaded = await uploadAdminPhotos(createdBody.id, photos, 0, setProgress);
        if (!uploaded.ok) {
          setError(uploaded.code);
          router.push(`/admin/vehicles/${createdBody.id}?saved=1`);
          return;
        }
      }

      notifyAdminSaved("빠른 등록이 완료되었습니다.");
      router.push(`/admin/vehicles/${createdBody.id}?saved=1`);
      router.refresh();
    } catch {
      setError("등록하지 못했습니다.");
    } finally {
      setPending(false);
      setProgress(null);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4">
        <div>
          <h2 className="text-lg font-semibold">1. 매물 문구 붙여넣기</h2>
          <p className="mt-1 text-sm text-muted">차명·년식·거리·기타·전화를 한 덩어리로 넣으면 카탈로그 제원까지 채웁니다.</p>
        </div>
        <textarea
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
          rows={6}
          className={field}
          placeholder={"● 차명 :유니버스 노블\n● 년식 :13년식\n● 거리 : 670,000KM\n● 기타 :자가용/수출용\n● 전화문의 바랍니다.010-0000-0000"}
        />
        <button type="button" onClick={applyPaste} className="justify-self-start rounded-md border border-line bg-[#eef3fb] px-4 py-2 text-sm font-semibold text-primary">
          자동 채우기
        </button>
        {draft.warnings.length ? (
          <ul className="grid gap-1 text-sm text-[#9f1239]">
            {draft.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold">2. 채운 값 확인 · 부족한 것만 수정</h2>
        </div>
        <Label text="매물번호">
          <input value={stockNo} onChange={(event) => setStockNo(event.target.value)} required className={field} />
        </Label>
        <Label text="상태">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={field}>
            <option value="available">판매 중</option>
            <option value="reserved">예약 중</option>
            <option value="review">검토 중</option>
            <option value="hidden">비공개</option>
          </select>
        </Label>
        <Label text="차급">
          <select
            value={draft.vehicleClass}
            onChange={(event) => setDraft((current) => ({ ...current, vehicleClass: event.target.value as VehicleClass }))}
            className={field}
          >
            <option value="county">카운티</option>
            <option value="medium">중형</option>
            <option value="large">대형</option>
          </select>
        </Label>
        <div className="md:col-span-2">
          <MakerModelPicker
            key={pickerKey}
            lang="ko"
            required
            defaultMaker={draft.maker}
            defaultModel={draft.model}
            vehicleClass={draft.vehicleClass}
            onModelChange={applyModel}
          />
        </div>
        <Label text="연식">
          <input
            value={draft.modelYear ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, modelYear: event.target.value ? Number(event.target.value) : null }))}
            className={field}
          />
        </Label>
        <Label text="월">
          <input
            value={draft.modelMonth ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, modelMonth: event.target.value ? Number(event.target.value) : null }))}
            className={field}
          />
        </Label>
        <Label text="주행거리 km">
          <input
            value={draft.mileageKm ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, mileageKm: event.target.value ? Number(event.target.value) : null }))}
            className={field}
          />
        </Label>
        <Label text="양도양수">
          <select value={transferType} onChange={(event) => setTransferType(event.target.value as TransferType)} className={field}>
            <option value="transfer">양도양수</option>
            <option value="scrap_replace">대폐차</option>
            <option value="private_export">수출용/자가용</option>
          </select>
        </Label>
        <Label text="기존 용도">
          <input
            value={draft.previousUseKo ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, previousUseKo: event.target.value || null }))}
            className={field}
          />
        </Label>
        <Label text="인승">
          <input
            value={draft.seats ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, seats: event.target.value ? Number(event.target.value) : null }))}
            className={field}
          />
        </Label>
        <Label text="마력">
          <input
            value={draft.horsepowerPs ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, horsepowerPs: event.target.value ? Number(event.target.value) : null }))}
            className={field}
          />
        </Label>
        <Label text="변속기">
          <select
            value={draft.transmission}
            onChange={(event) => setDraft((current) => ({ ...current, transmission: event.target.value as Transmission }))}
            className={field}
          >
            <option value="unknown">미확인</option>
            <option value="automatic">자동</option>
            <option value="manual">수동</option>
          </select>
        </Label>
        <Label text="연료">
          <select value={draft.fuel} onChange={(event) => setDraft((current) => ({ ...current, fuel: event.target.value as Fuel }))} className={field}>
            {["unknown", "diesel", "gasoline", "lpg", "cng", "electric", "hybrid"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Label>
        <Label text="엔진">
          <input
            value={draft.engineModel ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, engineModel: event.target.value || null }))}
            className={field}
          />
        </Label>
        <Label text="배기량 cc">
          <input
            value={draft.displacementCc ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, displacementCc: event.target.value ? Number(event.target.value) : null }))}
            className={field}
          />
        </Label>
        <Label text="핸들">
          <select
            value={draft.steering}
            onChange={(event) => setDraft((current) => ({ ...current, steering: event.target.value as Steering }))}
            className={field}
          >
            <option value="unknown">미확인</option>
            <option value="lhd">좌핸들</option>
            <option value="rhd">우핸들</option>
          </select>
        </Label>
        <Label text="설명 · 문의전화" className="md:col-span-2">
          <textarea
            value={draft.descriptionKo ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, descriptionKo: event.target.value || null }))}
            rows={4}
            className={field}
          />
        </Label>
      </section>

      <section className="grid gap-3 rounded-lg border border-line bg-white p-4">
        <div>
          <h2 className="text-lg font-semibold">3. 사진 올리기</h2>
          <p className="mt-1 text-sm text-muted">칸마다 여러 장 올릴 수 있습니다. 나중에 상세 화면에서도 같은 칸으로 추가할 수 있습니다.</p>
        </div>
        <AdminPhotoGroups ref={photoRef} disabled={pending} />
      </section>

      {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}
      {progress ? <p className="text-sm text-muted">{progress}</p> : null}
      <button disabled={pending} className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "등록 중…" : "빠른 등록"}
      </button>
    </form>
  );
}
