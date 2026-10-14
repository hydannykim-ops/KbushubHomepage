"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminVehicle, Agent, Inquiry, InquiryStatus } from "@/lib/domain/types";
import type { QuoteInput } from "@/lib/domain/validation";
import { inquiryStatusLabel } from "@/lib/labels";

const field = "rounded-md border border-line px-3 py-2 text-sm font-normal";

function inputValue(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export function VehicleForm({ vehicle }: { vehicle: AdminVehicle | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const v = vehicle;
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const payload = {
          stockNo: inputValue(form, "stockNo"),
          status: inputValue(form, "status"),
          vehicleClass: inputValue(form, "vehicleClass"),
          maker: inputValue(form, "maker"),
          model: inputValue(form, "model"),
          trim: inputValue(form, "trim"),
          modelYear: inputValue(form, "modelYear"),
          firstRegisteredOn: inputValue(form, "firstRegisteredOn"),
          mileageKm: inputValue(form, "mileageKm"),
          seats: inputValue(form, "seats"),
          transmission: inputValue(form, "transmission"),
          fuel: inputValue(form, "fuel"),
          engineModel: inputValue(form, "engineModel"),
          displacementCc: inputValue(form, "displacementCc"),
          steering: inputValue(form, "steering"),
          longBody: inputValue(form, "longBody"),
          lengthMm: inputValue(form, "lengthMm"),
          widthMm: inputValue(form, "widthMm"),
          heightMm: inputValue(form, "heightMm"),
          previousUseKo: inputValue(form, "previousUseKo"),
          previousUseEn: inputValue(form, "previousUseEn"),
          location: inputValue(form, "location"),
          maintenanceKo: inputValue(form, "maintenanceKo"),
          maintenanceEn: inputValue(form, "maintenanceEn"),
          defectsKo: inputValue(form, "defectsKo"),
          defectsEn: inputValue(form, "defectsEn"),
          descriptionKo: inputValue(form, "descriptionKo"),
          descriptionEn: inputValue(form, "descriptionEn"),
          photographedOn: inputValue(form, "photographedOn"),
          stockCheckedOn: inputValue(form, "stockCheckedOn"),
          featured: form.get("featured") === "on",
          domesticPriceKrw: inputValue(form, "domesticPriceKrw"),
          exportPriceAmount: inputValue(form, "exportPriceAmount"),
          exportPriceCurrency: inputValue(form, "exportPriceCurrency"),
          exportPriceTermsKo: inputValue(form, "exportPriceTermsKo"),
          exportPriceTermsEn: inputValue(form, "exportPriceTermsEn"),
          videoUrl: inputValue(form, "videoUrl"),
          internal: {
            purchaseCost: inputValue(form, "purchaseCost"),
            purchaseCurrency: inputValue(form, "purchaseCurrency"),
            actualSaleAmount: inputValue(form, "actualSaleAmount"),
            saleCurrency: inputValue(form, "saleCurrency"),
            extraCosts: inputValue(form, "extraCosts"),
            agentFee: inputValue(form, "agentFee"),
            feeCurrency: inputValue(form, "feeCurrency"),
            note: inputValue(form, "note"),
          },
        };
        const response = await fetch(vehicle ? `/api/admin/vehicles/${vehicle.id}` : "/api/admin/vehicles", {
          method: vehicle ? "PATCH" : "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as { ok?: boolean; id?: string; code?: string; errors?: Record<string, string> };
        if (!response.ok || !data.ok) {
          setError(data.errors ? Object.values(data.errors).join(" ") : data.code || "save_failed");
          return;
        }
        router.push(`/admin/vehicles/${data.id ?? vehicle?.id}`);
        router.refresh();
      }}
    >
      {error ? <p className="text-sm text-[#9f1239] md:col-span-2">{error}</p> : null}
      <Label text="매물번호"><input name="stockNo" required defaultValue={v?.stockNo ?? ""} className={field} /></Label>
      <Label text="상태">
        <select name="status" defaultValue={v?.status ?? "available"} className={field}>
          <option value="available">판매 중</option>
          <option value="reserved">예약 중</option>
          <option value="sold">판매 완료</option>
          <option value="hidden">비공개</option>
        </select>
      </Label>
      <Label text="차급">
        <select name="vehicleClass" defaultValue={v?.vehicleClass ?? "county"} className={field}>
          <option value="county">카운티</option>
          <option value="medium">중형</option>
          <option value="large">대형</option>
        </select>
      </Label>
      <Label text="제조사"><input name="maker" required defaultValue={v?.maker ?? ""} className={field} /></Label>
      <Label text="모델"><input name="model" required defaultValue={v?.model ?? ""} className={field} /></Label>
      <Label text="세부 모델"><input name="trim" defaultValue={v?.trim ?? ""} className={field} /></Label>
      <Label text="연식"><input name="modelYear" defaultValue={v?.modelYear ?? ""} className={field} /></Label>
      <Label text="최초 등록일"><input name="firstRegisteredOn" type="date" defaultValue={v?.firstRegisteredOn ?? ""} className={field} /></Label>
      <Label text="주행거리 km"><input name="mileageKm" defaultValue={v?.mileageKm ?? ""} className={field} /></Label>
      <Label text="인승"><input name="seats" defaultValue={v?.seats ?? ""} className={field} /></Label>
      <Label text="변속기">
        <select name="transmission" defaultValue={v?.transmission ?? "unknown"} className={field}>
          <option value="unknown">미확인</option>
          <option value="automatic">자동</option>
          <option value="manual">수동</option>
        </select>
      </Label>
      <Label text="연료">
        <select name="fuel" defaultValue={v?.fuel ?? "unknown"} className={field}>
          {["unknown", "diesel", "gasoline", "lpg", "cng", "electric", "hybrid"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Label>
      <Label text="엔진 모델"><input name="engineModel" defaultValue={v?.engineModel ?? ""} className={field} /></Label>
      <Label text="배기량 cc"><input name="displacementCc" defaultValue={v?.displacementCc ?? ""} className={field} /></Label>
      <Label text="핸들">
        <select name="steering" defaultValue={v?.steering ?? "unknown"} className={field}>
          <option value="unknown">미확인</option>
          <option value="lhd">좌핸들</option>
          <option value="rhd">우핸들</option>
        </select>
      </Label>
      <Label text="롱바디">
        <select name="longBody" defaultValue={v?.longBody == null ? "" : String(v.longBody)} className={field}>
          <option value="">미확인</option>
          <option value="true">예</option>
          <option value="false">아니오</option>
        </select>
      </Label>
      <Label text="전장 mm"><input name="lengthMm" defaultValue={v?.lengthMm ?? ""} className={field} /></Label>
      <Label text="전폭 mm"><input name="widthMm" defaultValue={v?.widthMm ?? ""} className={field} /></Label>
      <Label text="전고 mm"><input name="heightMm" defaultValue={v?.heightMm ?? ""} className={field} /></Label>
      <Label text="위치"><input name="location" defaultValue={v?.location ?? ""} className={field} /></Label>
      <Label text="국내 가격 KRW"><input name="domesticPriceKrw" defaultValue={v?.domesticPriceKrw ?? ""} className={field} /></Label>
      <Label text="수출 금액"><input name="exportPriceAmount" defaultValue={v?.exportPriceAmount ?? ""} className={field} /></Label>
      <Label text="수출 통화"><input name="exportPriceCurrency" defaultValue={v?.exportPriceCurrency ?? ""} className={field} /></Label>
      <Label text="촬영일"><input name="photographedOn" type="date" defaultValue={v?.photographedOn ?? ""} className={field} /></Label>
      <Label text="재고 확인일"><input name="stockCheckedOn" type="date" defaultValue={v?.stockCheckedOn ?? ""} className={field} /></Label>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input name="featured" type="checkbox" defaultChecked={v?.featured ?? false} /> 추천 매물
      </label>
      <Label text="기존 용도 한국어"><input name="previousUseKo" defaultValue={v?.previousUseKo ?? ""} className={field} /></Label>
      <Label text="기존 용도 영어"><input name="previousUseEn" defaultValue={v?.previousUseEn ?? ""} className={field} /></Label>
      <Label text="수출 조건 한국어"><input name="exportPriceTermsKo" defaultValue={v?.exportPriceTermsKo ?? ""} className={field} /></Label>
      <Label text="수출 조건 영어"><input name="exportPriceTermsEn" defaultValue={v?.exportPriceTermsEn ?? ""} className={field} /></Label>
      <Label text="영상 https 링크" className="md:col-span-2"><input name="videoUrl" defaultValue={v?.videoUrl ?? ""} className={field} /></Label>
      <Label text="정비 확인 한국어" className="md:col-span-2"><textarea name="maintenanceKo" defaultValue={v?.maintenanceKo ?? ""} rows={3} className={field} /></Label>
      <Label text="정비 확인 영어" className="md:col-span-2"><textarea name="maintenanceEn" defaultValue={v?.maintenanceEn ?? ""} rows={3} className={field} /></Label>
      <Label text="결함 한국어" className="md:col-span-2"><textarea name="defectsKo" defaultValue={v?.defectsKo ?? ""} rows={3} className={field} /></Label>
      <Label text="결함 영어" className="md:col-span-2"><textarea name="defectsEn" defaultValue={v?.defectsEn ?? ""} rows={3} className={field} /></Label>
      <Label text="설명 한국어" className="md:col-span-2"><textarea name="descriptionKo" defaultValue={v?.descriptionKo ?? ""} rows={4} className={field} /></Label>
      <Label text="설명 영어" className="md:col-span-2"><textarea name="descriptionEn" defaultValue={v?.descriptionEn ?? ""} rows={4} className={field} /></Label>
      <fieldset className="grid gap-3 rounded-lg border border-line p-4 md:col-span-2 md:grid-cols-2">
        <legend className="px-2 text-sm font-semibold">내부 재무 · 공개 API에 포함되지 않음 · 자동 정산 없음</legend>
        <Label text="매입원가"><input name="purchaseCost" defaultValue={v?.internal.purchaseCost ?? ""} className={field} /></Label>
        <Label text="매입 통화"><input name="purchaseCurrency" defaultValue={v?.internal.purchaseCurrency ?? ""} className={field} /></Label>
        <Label text="실제 판매금액"><input name="actualSaleAmount" defaultValue={v?.internal.actualSaleAmount ?? ""} className={field} /></Label>
        <Label text="판매 통화"><input name="saleCurrency" defaultValue={v?.internal.saleCurrency ?? ""} className={field} /></Label>
        <Label text="부대비용"><input name="extraCosts" defaultValue={v?.internal.extraCosts ?? ""} className={field} /></Label>
        <Label text="에이전트 수수료 기록"><input name="agentFee" defaultValue={v?.internal.agentFee ?? ""} className={field} /></Label>
        <Label text="수수료 통화"><input name="feeCurrency" defaultValue={v?.internal.feeCurrency ?? ""} className={field} /></Label>
        <Label text="내부 메모" className="md:col-span-2"><textarea name="note" defaultValue={v?.internal.note ?? ""} rows={2} className={field} /></Label>
      </fieldset>
      <button className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white md:col-span-2">저장</button>
    </form>
  );
}

function Label({ text, children, className = "" }: { text: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`grid gap-1 text-sm font-medium ${className}`}>
      {text}
      {children}
    </label>
  );
}

export function InquiryEditor({ inquiry, agents }: { inquiry: Inquiry; agents: Agent[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({
            status: form.get("status"),
            staffMemo: form.get("staffMemo"),
            closeReason: form.get("closeReason"),
            assignedAgentId: form.get("assignedAgentId"),
            assignmentReason: form.get("assignmentReason"),
          }),
        });
        const data = (await response.json()) as { ok?: boolean; code?: string; errors?: Record<string, string> };
        if (!response.ok || !data.ok) setError(data.errors ? Object.values(data.errors).join(" ") : data.code || "save_failed");
        else router.refresh();
      }}
    >
      {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}
      <label className="grid gap-1 text-sm">
        상태
        <select name="status" defaultValue={inquiry.status} className={field}>
          {(["new", "consulting", "quoted", "negotiating", "contracted", "closed"] as const).map((status: InquiryStatus) => (
            <option key={status} value={status}>
              {inquiryStatusLabel(status, "ko")}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        담당 에이전트
        <select name="assignedAgentId" defaultValue={inquiry.assignedAgentId ?? ""} className={field}>
          <option value="">없음</option>
          {agents.filter((agent) => agent.status === "approved").map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agent.referralCode})
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        담당 변경 사유
        <input name="assignmentReason" className={field} placeholder="담당을 바꿀 때만 입력" />
      </label>
      <label className="grid gap-1 text-sm">
        담당자 메모
        <textarea name="staffMemo" defaultValue={inquiry.staffMemo ?? ""} rows={4} className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        종료 사유
        <input name="closeReason" defaultValue={inquiry.closeReason ?? ""} className={field} />
      </label>
      <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">저장</button>
    </form>
  );
}

export function QuoteForm({ inquiryId, stockNo }: { inquiryId: string; stockNo: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const keys = ["vehiclePrice", "domesticTransport", "exportCosts", "oceanFreight", "otherCosts"] as const;
  const labels: Record<(typeof keys)[number], string> = {
    vehiclePrice: "차량대금",
    domesticTransport: "국내 운송비",
    exportCosts: "수출 관련 비용",
    oceanFreight: "해상운임",
    otherCosts: "보험·검사 등 기타",
  };
  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const lines = {} as QuoteInput["lines"];
        for (const key of keys) {
          const status = String(form.get(`${key}Status`)) as "amount" | "zero" | "unknown";
          const raw = String(form.get(`${key}Amount`) ?? "");
          lines[key] = { status, amount: raw === "" ? null : Number(raw) };
        }
        const response = await fetch("/api/admin/quotes", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({
            inquiryId,
            currency: form.get("currency"),
            lines,
            includedItems: form.get("includedItems"),
            excludedItems: form.get("excludedItems"),
            tradeTerms: form.get("tradeTerms"),
            validUntil: form.get("validUntil"),
          }),
        });
        const data = (await response.json()) as { ok?: boolean; code?: string; errors?: Record<string, string> };
        if (!response.ok || !data.ok) setError(data.errors ? Object.values(data.errors).join(" ") : data.code || "save_failed");
        else router.push("/admin/quotes");
      }}
    >
      {error ? <p className="text-sm text-[#9f1239]">{error}</p> : null}
      <p className="text-sm text-muted">매물 {stockNo ?? "-"}의 현재 가격과 별도로 저장됩니다. 미확인 항목이 있으면 총액을 확정하지 않습니다.</p>
      <label className="grid gap-1 text-sm">
        통화
        <select name="currency" className={field} defaultValue="USD">
          {["USD", "EUR", "KRW", "JPY", "CNY", "AED"].map((currency) => (
            <option key={currency}>{currency}</option>
          ))}
        </select>
      </label>
      {keys.map((key) => (
        <div key={key} className="grid gap-2 rounded-md border border-line p-3 md:grid-cols-[1fr_160px_1fr]">
          <span className="text-sm font-medium">{labels[key]}</span>
          <select name={`${key}Status`} defaultValue="unknown" className={field}>
            <option value="amount">금액</option>
            <option value="zero">0원</option>
            <option value="unknown">미확인</option>
          </select>
          <input name={`${key}Amount`} className={field} inputMode="decimal" placeholder="금액일 때만" />
        </div>
      ))}
      <label className="grid gap-1 text-sm">포함 항목<textarea name="includedItems" className={field} rows={2} /></label>
      <label className="grid gap-1 text-sm">제외 항목<textarea name="excludedItems" className={field} rows={2} /></label>
      <label className="grid gap-1 text-sm">거래 조건<textarea name="tradeTerms" className={field} rows={2} /></label>
      <label className="grid gap-1 text-sm">유효기간<input name="validUntil" type="date" className={field} /></label>
      <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">견적 저장</button>
    </form>
  );
}
