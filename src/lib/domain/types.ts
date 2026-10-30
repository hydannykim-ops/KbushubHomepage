export type Lang = "ko" | "en" | "es" | "fr" | "km" | "mn";
export type TradeMode = "domestic" | "export";
export type SaleStatus = "available" | "reserved" | "sold" | "hidden" | "review";
export type VehicleClass = "county" | "medium" | "large";
export type Transmission = "manual" | "automatic" | "unknown";
export type Fuel = "diesel" | "gasoline" | "lpg" | "cng" | "electric" | "hybrid" | "unknown";
export type Steering = "lhd" | "rhd" | "unknown";
/** Domestic Korea bus transfer status used by operators and buyers. */
export type TransferType = "transfer" | "scrap_replace" | "unknown";
/** Export buyer preference only — staff still quote freight. */
export type ShippingMethod = "roro" | "container" | "undecided";
export type PhotoCategory = "front" | "front_side" | "rear" | "exterior" | "interior" | "dashboard" | "engine" | "tires" | "defect";
export type MemberRole = "customer" | "dealer";
export type ListingSource = "company" | "dealer";
export type InquiryKind = "purchase" | "visit" | "quote" | "video" | "general";
export type InquiryStatus = "new" | "consulting" | "quoted" | "negotiating" | "contracted" | "closed";
export type MoneyStatus = "amount" | "zero" | "unknown";
export type AgentStatus = "pending" | "approved" | "rejected" | "suspended";
export type RequestType = "wanted" | "sell" | "scrap";
export type RequestStatus = "new" | "consulting" | "closed";
export type SortKey = "newest" | "year_desc" | "year_asc" | "price_asc" | "price_desc" | "mileage_asc";

export type VehiclePhoto = {
  id: string;
  vehicleId: string;
  category: PhotoCategory;
  placeholder: boolean;
  storage: "placeholder" | "file" | "supabase";
  path: string | null;
  contentType: string | null;
  sortOrder: number;
  isCover: boolean;
  altKo: string;
  altEn: string;
};

export type VehicleInternal = {
  purchaseCost: number | null;
  purchaseCurrency: string | null;
  actualSaleAmount: number | null;
  saleCurrency: string | null;
  extraCosts: number | null;
  agentFee: number | null;
  feeCurrency: string | null;
  note: string | null;
};

export type PublicVehicle = {
  id: string;
  stockNo: string;
  status: Exclude<SaleStatus, "hidden" | "review">;
  vehicleClass: VehicleClass;
  maker: string;
  model: string;
  trim: string | null;
  modelYear: number | null;
  /** 1–12 when known; shown with year as 2020/03. */
  modelMonth: number | null;
  firstRegisteredOn: string | null;
  mileageKm: number | null;
  seats: number | null;
  horsepowerPs: number | null;
  transmission: Transmission;
  fuel: Fuel;
  engineModel: string | null;
  displacementCc: number | null;
  steering: Steering;
  longBody: boolean | null;
  transferType: TransferType;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  previousUseKo: string | null;
  previousUseEn: string | null;
  location: string | null;
  maintenanceKo: string | null;
  maintenanceEn: string | null;
  defectsKo: string | null;
  defectsEn: string | null;
  descriptionKo: string | null;
  descriptionEn: string | null;
  photographedOn: string | null;
  stockCheckedOn: string | null;
  featured: boolean;
  domesticPriceKrw: number | null;
  exportPriceAmount: number | null;
  exportPriceCurrency: string | null;
  exportPriceTermsKo: string | null;
  exportPriceTermsEn: string | null;
  videoUrl: string | null;
  photos: VehiclePhoto[];
  createdAt: string;
  updatedAt: string;
  demo: boolean;
  /** Dealer mutual/trade name when the listing is dealer-sourced; null for company stock. */
  listingCompany: string | null;
};

export type AdminVehicle = Omit<PublicVehicle, "status" | "listingCompany"> & {
  status: SaleStatus;
  internal: VehicleInternal;
  ownerId: string | null;
  listingSource: ListingSource;
  sellerName: string | null;
  sellerEmail: string | null;
  sellerCompany: string | null;
};

export type Member = {
  id: string;
  role: MemberRole;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  createdAt: string;
};

export type OwnedListing = Omit<PublicVehicle, "status" | "listingCompany"> & {
  status: SaleStatus;
  listingSource: ListingSource;
  listingCompany: string | null;
};

export type SiteSettings = {
  companyName: string;
  phone: string | null;
  kakaoUrl: string | null;
  whatsappE164: string | null;
  email: string | null;
  address: string | null;
  businessHours: string | null;
  aboutKo: string | null;
  aboutEn: string | null;
  privacyPolicyKo: string | null;
  privacyPolicyEn: string | null;
  privacyCollectionEnabled: boolean;
  updatedAt: string;
};

/** Who wrote a line in an inquiry thread (async chat, not realtime). */
export type InquiryMessageAuthor = "buyer" | "seller" | "staff";

export type InquiryMessage = {
  id: string;
  inquiryId: string;
  authorRole: InquiryMessageAuthor;
  authorId: string | null;
  body: string;
  createdAt: string;
};

export type Inquiry = {
  id: string;
  kind: InquiryKind;
  tradeMode: TradeMode;
  name: string;
  email: string | null;
  phone: string | null;
  messenger: string | null;
  country: string;
  vehicleId: string | null;
  stockNo: string | null;
  message: string;
  /** Logged-in member who submitted the inquiry, when known. */
  memberId: string | null;
  destinationCountry: string | null;
  destinationPort: string | null;
  destinationPortUndecided: boolean;
  shippingMethod: ShippingMethod | null;
  firstReferralCode: string | null;
  submitReferralCode: string | null;
  assignedAgentId: string | null;
  status: InquiryStatus;
  closeReason: string | null;
  staffMemo: string | null;
  consentAt: string | null;
  createdAt: string;
  updatedAt: string;
  demo: boolean;
};

/** Inquiry row shown in account inboxes (no staff memo). */
export type InquiryThreadSummary = {
  id: string;
  kind: InquiryKind;
  tradeMode: TradeMode;
  stockNo: string | null;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  viewerRole: InquiryMessageAuthor;
};

export type AgentReferral = {
  id: string;
  createdAt: string;
  stockNo: string | null;
  tradeMode: TradeMode;
  status: InquiryStatus;
};

export type AssignmentHistory = {
  id: string;
  inquiryId: string;
  previousAgentId: string | null;
  nextAgentId: string | null;
  reason: string;
  actor: string;
  createdAt: string;
};

export type QuoteLine = {
  status: MoneyStatus;
  amount: number | null;
};

export type QuoteLineKey =
  | "vehiclePrice"
  | "domesticTransport"
  | "exportCosts"
  | "oceanFreight"
  | "otherCosts";

export type Quote = {
  id: string;
  inquiryId: string;
  version: number;
  currency: string;
  lines: Record<QuoteLineKey, QuoteLine>;
  includedItems: string | null;
  excludedItems: string | null;
  tradeTerms: string | null;
  validUntil: string | null;
  vehicleStockNo: string | null;
  createdAt: string;
  demo: boolean;
};

export type Agent = {
  id: string;
  userId: string | null;
  status: AgentStatus;
  name: string;
  company: string | null;
  country: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
  demo: boolean;
};

export type StoredFile = {
  id: string;
  requestId: string;
  path: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
};

export type VehicleRequest = {
  id: string;
  type: RequestType;
  model: string;
  /** Vehicle plate / registration number — mainly for scrap quotes. */
  plateNo: string | null;
  modelYear: number | null;
  mileageKm: number | null;
  seats: number | null;
  quantity: number | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  askingPriceAmount: number | null;
  askingPriceCurrency: string | null;
  location: string | null;
  destinationCountry: string | null;
  desiredTime: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: RequestStatus;
  staffMemo: string | null;
  firstReferralCode: string | null;
  files: StoredFile[];
  createdAt: string;
  updatedAt: string;
  demo: boolean;
};

export type VehicleQuery = {
  q?: string;
  maker?: string;
  model?: string;
  vehicleClass?: VehicleClass | "";
  yearMin?: number | null;
  yearMax?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  priceCurrency?: string | null;
  seatsMin?: number | null;
  mileageMax?: number | null;
  transmission?: Transmission | "";
  fuel?: Fuel | "";
  transferType?: TransferType | "";
  status?: SaleStatus | "";
  sort?: SortKey;
};

export type SessionRole = "admin" | "agent" | "customer" | "dealer";

export type Session = {
  sub: string;
  role: SessionRole;
  email: string;
  name?: string;
  agentId?: string;
  referralCode?: string;
  exp: number;
};
