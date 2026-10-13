export type Locale = "ko" | "en";
export type TradeMode = "domestic" | "export";
export type VehicleClass = "county" | "medium" | "large";
export type SaleStatus = "available" | "reserved" | "sold" | "hidden";
export type Transmission = "manual" | "automatic" | "unknown";
export type Fuel = "diesel" | "gasoline" | "lpg" | "cng" | "electric" | "unknown";
export type Steering = "lhd" | "rhd" | "unknown";
export type PhotoCategory =
  | "exterior"
  | "interior"
  | "dashboard"
  | "engine"
  | "tires"
  | "defect";
export type Currency = "KRW" | "USD" | "EUR";
export type InquiryKind =
  | "purchase"
  | "visit"
  | "quote"
  | "video"
  | "similar"
  | "general";
export type InquiryStatus =
  | "new"
  | "consulting"
  | "quoted"
  | "negotiating"
  | "contract"
  | "closed";
export type AgentStatus = "pending" | "approved" | "rejected";

export type TextPair = { ko: string; en: string };

export type Photo = {
  id: string;
  category: PhotoCategory;
  alt: TextPair;
  file: string | null;
};

export type Money = { amount: number; currency: Currency };

export type ExportOffer = {
  amount: number;
  currency: Currency;
  terms: string;
  includes: TextPair;
};

export type VehicleInternal = {
  purchaseCost: number | null;
  actualSaleAmount: number | null;
  extraCosts: number | null;
  agentFee: number | null;
};

export type Vehicle = {
  id: string;
  manufacturerKey: string;
  manufacturer: TextPair;
  modelKey: string;
  model: TextPair;
  trim: TextPair;
  class: VehicleClass;
  year: number;
  firstRegistered: string | null;
  mileageKm: number | null;
  seats: number | null;
  transmission: Transmission;
  fuel: Fuel;
  engineModel: string | null;
  displacementCc: number | null;
  steering: Steering;
  longBody: boolean | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  previousUse: TextPair | null;
  location: TextPair | null;
  maintenance: TextPair | null;
  knownDefects: TextPair | null;
  photographedAt: string | null;
  stockCheckedAt: string | null;
  description: TextPair;
  status: SaleStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  domesticPrice: Money | null;
  exportPrice: ExportOffer | null;
  photos: Photo[];
  videoUrl: string | null;
  sample: boolean;
  internal?: VehicleInternal;
};

export type PublicVehicle = Omit<Vehicle, "internal">;

export type ReferralChange = {
  at: string;
  fromAgentId: string | null;
  toAgentId: string | null;
  reason: string;
};

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  contact: string;
  trade: TradeMode;
  country: string;
  vehicleId: string | null;
  message: string;
  kind: InquiryKind;
  destinationCountry: string | null;
  destinationPort: string | null;
  portUndecided: boolean;
  status: InquiryStatus;
  staffNote: string;
  closeReason: string;
  referralCode: string | null;
  assignedAgentId: string | null;
  referralHistory: ReferralChange[];
  consentAt: string;
  policyVersion: string;
  demo: boolean;
};

export type Quote = {
  id: string;
  inquiryId: string;
  vehicleId: string | null;
  version: number;
  createdAt: string;
  validUntil: string | null;
  currency: Currency;
  vehiclePrice: number | null;
  domesticTransport: number | null;
  exportCosts: number | null;
  oceanFreight: number | null;
  otherCosts: number | null;
  included: string;
  excluded: string;
  terms: string;
  demo: boolean;
};

export type Agent = {
  id: string;
  createdAt: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  note: string;
  passwordHash: string;
  status: AgentStatus;
  code: string;
};

export type VehicleRequestLead = {
  id: string;
  type: "request";
  createdAt: string;
  model: string;
  budgetAmount: number | null;
  budgetCurrency: Currency;
  yearFrom: number | null;
  yearTo: number | null;
  seats: number | null;
  quantity: number;
  country: string;
  timing: string;
  contactName: string;
  contact: string;
  referralCode: string | null;
  consentAt: string;
  demo: boolean;
};

export type SellLead = {
  id: string;
  type: "sell";
  createdAt: string;
  model: string;
  year: number | null;
  mileageKm: number | null;
  location: string;
  askingAmount: number | null;
  askingCurrency: Currency;
  contactName: string;
  contact: string;
  note: string;
  photos: { name: string; storedAs: string; size: number }[];
  referralCode: string | null;
  consentAt: string;
  demo: boolean;
};

export type Lead = VehicleRequestLead | SellLead;

export type Settings = {
  companyNameKo: string;
  companyNameEn: string;
  representative: string;
  businessNo: string;
  phone: string;
  kakaoUrl: string;
  whatsapp: string;
  email: string;
  addressKo: string;
  addressEn: string;
  hoursKo: string;
  hoursEn: string;
  privacyIntakeEnabled: boolean;
};

export type DB = {
  version: 1;
  vehicles: Vehicle[];
  inquiries: Inquiry[];
  quotes: Quote[];
  agents: Agent[];
  leads: Lead[];
  settings: Settings;
};

export type AgentInquiryView = {
  id: string;
  createdAt: string;
  status: InquiryStatus;
  trade: TradeMode;
  vehicleId: string | null;
  referralCode: string | null;
};

export const POLICY_VERSION = "draft-0";
export const PAGE_SIZE = 9;
