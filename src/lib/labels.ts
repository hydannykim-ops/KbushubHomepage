import type {
  Fuel,
  InquiryStatus,
  Lang,
  PhotoCategory,
  SaleStatus,
  ShippingMethod,
  Steering,
  TransferType,
  Transmission,
  VehicleClass,
} from "./domain/types";
import { contentFieldLang } from "./i18n/langs";

const ko = {
  status: { available: "판매 중", reserved: "예약 중", sold: "판매 완료", hidden: "비공개", review: "검토 중" },
  class: { county: "카운티", medium: "중형버스", large: "대형버스" },
  transmission: { manual: "수동", automatic: "자동", unknown: "미확인" },
  fuel: { diesel: "디젤", gasoline: "가솔린", lpg: "LPG", cng: "CNG", electric: "전기", hybrid: "하이브리드", unknown: "미확인" },
  steering: { lhd: "좌핸들", rhd: "우핸들", unknown: "미확인" },
  transfer: { transfer: "양도양수", scrap_replace: "대폐차", unknown: "미확인" },
  shipping: { roro: "RoRo", container: "컨테이너", undecided: "미정" },
  photo: { front: "정면", front_side: "좌측", rear: "후면", exterior: "우측·외관", interior: "실내·좌석", dashboard: "계기판", engine: "엔진룸·하부", tires: "타이어", defect: "결함" },
  inquiry: { new: "신규", consulting: "상담 중", quoted: "견적 발송", negotiating: "협의 중", contracted: "계약", closed: "종료" },
  longBody: { yes: "롱바디", no: "숏바디", unknown: "미확인" },
} as const;

const en = {
  status: { available: "Available", reserved: "Reserved", sold: "Sold", hidden: "Hidden", review: "In review" },
  class: { county: "County", medium: "Medium bus", large: "Large bus" },
  transmission: { manual: "Manual", automatic: "Automatic", unknown: "Not confirmed" },
  fuel: { diesel: "Diesel", gasoline: "Gasoline", lpg: "LPG", cng: "CNG", electric: "Electric", hybrid: "Hybrid", unknown: "Not confirmed" },
  steering: { lhd: "Left-hand drive", rhd: "Right-hand drive", unknown: "Not confirmed" },
  transfer: { transfer: "License transfer", scrap_replace: "Scrap-and-replace", unknown: "Not confirmed" },
  shipping: { roro: "RoRo", container: "Container", undecided: "Undecided" },
  photo: { front: "Front", front_side: "Front three-quarter", rear: "Rear", exterior: "Exterior", interior: "Interior and seats", dashboard: "Dashboard", engine: "Engine bay and underside", tires: "Tires", defect: "Defects" },
  inquiry: { new: "New", consulting: "In consultation", quoted: "Quote sent", negotiating: "Negotiating", contracted: "Contract", closed: "Closed" },
  longBody: { yes: "Long body", no: "Short body", unknown: "Not confirmed" },
} as const;

const es = {
  status: { available: "Disponible", reserved: "Reservado", sold: "Vendido", hidden: "Oculto", review: "En revisión" },
  class: { county: "County", medium: "Bus mediano", large: "Bus grande" },
  transmission: { manual: "Manual", automatic: "Automática", unknown: "No confirmado" },
  fuel: { diesel: "Diésel", gasoline: "Gasolina", lpg: "GLP", cng: "GNC", electric: "Eléctrico", hybrid: "Híbrido", unknown: "No confirmado" },
  steering: { lhd: "Volante a la izquierda", rhd: "Volante a la derecha", unknown: "No confirmado" },
  transfer: { transfer: "Cesión de licencia", scrap_replace: "Sustitución por chatarrización", unknown: "No confirmado" },
  shipping: { roro: "RoRo", container: "Contenedor", undecided: "Sin decidir" },
  photo: { front: "Frontal", front_side: "Tres cuartos delantera", rear: "Trasera", exterior: "Exterior", interior: "Interior y asientos", dashboard: "Tablero", engine: "Motor y bajos", tires: "Llantas", defect: "Defectos" },
  inquiry: { new: "Nueva", consulting: "En consulta", quoted: "Cotización enviada", negotiating: "Negociando", contracted: "Contrato", closed: "Cerrada" },
  longBody: { yes: "Carrocería larga", no: "Carrocería corta", unknown: "No confirmado" },
} as const;

const fr = {
  status: { available: "Disponible", reserved: "Réservé", sold: "Vendu", hidden: "Masqué", review: "En révision" },
  class: { county: "County", medium: "Bus moyen", large: "Grand bus" },
  transmission: { manual: "Manuelle", automatic: "Automatique", unknown: "Non confirmé" },
  fuel: { diesel: "Diesel", gasoline: "Essence", lpg: "GPL", cng: "GNC", electric: "Électrique", hybrid: "Hybride", unknown: "Non confirmé" },
  steering: { lhd: "Conduite à gauche", rhd: "Conduite à droite", unknown: "Non confirmé" },
  transfer: { transfer: "Transfert de licence", scrap_replace: "Remplacement après mise au rebut", unknown: "Non confirmé" },
  shipping: { roro: "RoRo", container: "Conteneur", undecided: "Non décidé" },
  photo: { front: "Avant", front_side: "Trois-quarts avant", rear: "Arrière", exterior: "Extérieur", interior: "Intérieur et sièges", dashboard: "Tableau de bord", engine: "Moteur et dessous", tires: "Pneus", defect: "Défauts" },
  inquiry: { new: "Nouvelle", consulting: "En consultation", quoted: "Devis envoyé", negotiating: "Négociation", contracted: "Contrat", closed: "Clôturée" },
  longBody: { yes: "Carrosserie longue", no: "Carrosserie courte", unknown: "Non confirmé" },
} as const;

const km = {
  status: { available: "កំពុងលក់", reserved: "បានកក់", sold: "បានលក់", hidden: "លាក់", review: "កំពុងពិនិត្យ" },
  class: { county: "County", medium: "ឡានក្រុងមធ្យម", large: "ឡានក្រុងធំ" },
  transmission: { manual: "ដៃ", automatic: "ស្វ័យប្រវត្តិ", unknown: "មិនបានបញ្ជាក់" },
  fuel: { diesel: "ម៉ាស៊ូត", gasoline: "សាំង", lpg: "LPG", cng: "CNG", electric: "អគ្គិសនី", hybrid: "ហាយប្រ៊ីត", unknown: "មិនបានបញ្ជាក់" },
  steering: { lhd: "ចង្កូតឆ្វេង", rhd: "ចង្កូតស្តាំ", unknown: "មិនបានបញ្ជាក់" },
  transfer: { transfer: "ផ្ទេរអាជ្ញាប័ណ្ណ", scrap_replace: "ជំនួសបន្ទាប់ពីកម្ទេច", unknown: "មិនបានបញ្ជាក់" },
  shipping: { roro: "RoRo", container: "កុងតឺន័រ", undecided: "មិនទាន់សម្រេច" },
  photo: { front: "ខាងមុខ", front_side: "ខាងមុខបីភាគបួន", rear: "ខាងក្រោយ", exterior: "ខាងក្រៅ", interior: "ខាងក្នុង និងកៅអី", dashboard: "ផ្ទាំងគ្រប់គ្រង", engine: "បន្ទប់ម៉ាស៊ីន និងផ្នែកក្រោម", tires: "សំបកកង់", defect: "ពិការភាព" },
  inquiry: { new: "ថ្មី", consulting: "កំពុងពិគ្រោះ", quoted: "បានផ្ញើសម្រង់", negotiating: "កំពុងចរចា", contracted: "កិច្ចសន្យា", closed: "បិទ" },
  longBody: { yes: "តួវែង", no: "តួខ្លី", unknown: "មិនបានបញ្ជាក់" },
} as const;

const mn = {
  status: { available: "Зарагдаж байна", reserved: "Захиалсан", sold: "Зарагдсан", hidden: "Нуугдсан", review: "Шалгагдаж байна" },
  class: { county: "County", medium: "Дунд автобус", large: "Том автобус" },
  transmission: { manual: "Механик", automatic: "Автомат", unknown: "Баталгаажаагүй" },
  fuel: { diesel: "Дизель", gasoline: "Бензин", lpg: "LPG", cng: "CNG", electric: "Цахилгаан", hybrid: "Гибрид", unknown: "Баталгаажаагүй" },
  steering: { lhd: "Зүүн жолоо", rhd: "Баруун жолоо", unknown: "Баталгаажаагүй" },
  transfer: { transfer: "Зөвшөөрөл шилжүүлэх", scrap_replace: "Хаягдал солилцох", unknown: "Баталгаажаагүй" },
  shipping: { roro: "RoRo", container: "Чингэлэг", undecided: "Шийдэгдээгүй" },
  photo: { front: "Урд", front_side: "Урд гурван дөрөвний нэг", rear: "Ард", exterior: "Гадна", interior: "Дотор ба суудал", dashboard: "Самбар", engine: "Хөдөлгүүр ба доод хэсэг", tires: "Дугуй", defect: "Гэмтэл" },
  inquiry: { new: "Шинэ", consulting: "Зөвлөгөөнд", quoted: "Үнийн санал илгээсэн", negotiating: "Хэлэлцэж байна", contracted: "Гэрээ", closed: "Хаагдсан" },
  longBody: { yes: "Урт их бие", no: "Богино их бие", unknown: "Баталгаажаагүй" },
} as const;

const catalog = { ko, en, es, fr, km, mn } as const;

export const photoCategoryList: PhotoCategory[] = ["front", "front_side", "rear", "exterior", "interior", "dashboard", "engine", "tires", "defect"];

export function labels(lang: Lang) {
  return catalog[lang] ?? catalog[contentFieldLang(lang)];
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

export function transferLabel(value: TransferType, lang: Lang) {
  return labels(lang).transfer[value];
}

export function shippingLabel(value: ShippingMethod, lang: Lang) {
  return labels(lang).shipping[value];
}
