import type { Fuel, InquiryStatus, Lang, PhotoCategory, SaleStatus, Steering, Transmission, VehicleClass } from "./domain/types";

const ko = {
  status: { available: "판매 중", reserved: "예약 중", sold: "판매 완료", hidden: "비공개", review: "검토 중" },
  class: { county: "카운티", medium: "중형버스", large: "대형버스" },
  transmission: { manual: "수동", automatic: "자동", unknown: "미확인" },
  fuel: { diesel: "디젤", gasoline: "가솔린", lpg: "LPG", cng: "CNG", electric: "전기", hybrid: "하이브리드", unknown: "미확인" },
  steering: { lhd: "좌핸들", rhd: "우핸들", unknown: "미확인" },
  photo: { front: "정면", front_side: "정측면", rear: "후면", exterior: "외관", interior: "실내·좌석", dashboard: "계기판", engine: "엔진룸·하부", tires: "타이어", defect: "결함" },
  inquiry: { new: "신규", consulting: "상담 중", quoted: "견적 발송", negotiating: "협의 중", contracted: "계약", closed: "종료" },
  longBody: { yes: "롱바디", no: "숏바디", unknown: "미확인" },
} as const;

const en = {
  status: { available: "Available", reserved: "Reserved", sold: "Sold", hidden: "Hidden", review: "In review" },
  class: { county: "County", medium: "Medium bus", large: "Large bus" },
  transmission: { manual: "Manual", automatic: "Automatic", unknown: "Not confirmed" },
  fuel: { diesel: "Diesel", gasoline: "Gasoline", lpg: "LPG", cng: "CNG", electric: "Electric", hybrid: "Hybrid", unknown: "Not confirmed" },
  steering: { lhd: "Left-hand drive", rhd: "Right-hand drive", unknown: "Not confirmed" },
  photo: { front: "Front", front_side: "Front three-quarter", rear: "Rear", exterior: "Exterior", interior: "Interior and seats", dashboard: "Dashboard", engine: "Engine bay and underside", tires: "Tires", defect: "Defects" },
  inquiry: { new: "New", consulting: "In consultation", quoted: "Quote sent", negotiating: "Negotiating", contracted: "Contract", closed: "Closed" },
  longBody: { yes: "Long body", no: "Short body", unknown: "Not confirmed" },
} as const;

export const photoCategoryList: PhotoCategory[] = ["front", "front_side", "rear", "exterior", "interior", "dashboard", "engine", "tires", "defect"];

export function labels(lang: Lang) {
  return lang === "en" ? en : ko;
}

export function statusLabel(status: SaleStatus, lang: Lang) {
  return labels(lang).status[status];
}

export function classLabel(value: VehicleClass, lang: Lang) {
  return labels(lang).class[value];
}

export function transmissionLabel(value: Transmission, lang: Lang) {
  return labels(lang).transmission[value];
}

export function fuelLabel(value: Fuel, lang: Lang) {
  return labels(lang).fuel[value];
}

export function steeringLabel(value: Steering, lang: Lang) {
  return labels(lang).steering[value];
}

export function photoLabel(value: PhotoCategory, lang: Lang) {
  return labels(lang).photo[value];
}

export function inquiryStatusLabel(value: InquiryStatus, lang: Lang) {
  return labels(lang).inquiry[value];
}

export function longBodyLabel(value: boolean | null, lang: Lang) {
  if (value == null) return labels(lang).longBody.unknown;
  return value ? labels(lang).longBody.yes : labels(lang).longBody.no;
}
