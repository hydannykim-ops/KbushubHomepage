import type {
  AdminVehicle,
  Agent,
  AgentReferral,
  Inquiry,
  InquiryMessage,
  InquiryMessageAuthor,
  InquiryThreadSummary,
  OwnedListing,
  PublicVehicle,
} from "./types";

const internalNames = [
  "internal",
  "purchaseCost",
  "purchaseCurrency",
  "actualSaleAmount",
  "saleCurrency",
  "extraCosts",
  "agentFee",
  "feeCurrency",
  "staffMemo",
  "closeReason",
] as const;

export function toPublicVehicle(vehicle: AdminVehicle): PublicVehicle | null {
  if (vehicle.status === "hidden" || vehicle.status === "review") return null;
  const publicVehicle: PublicVehicle = {
    id: vehicle.id,
    stockNo: vehicle.stockNo,
    status: vehicle.status,
    vehicleClass: vehicle.vehicleClass,
    maker: vehicle.maker,
    model: vehicle.model,
    trim: vehicle.trim,
    modelYear: vehicle.modelYear,
    firstRegisteredOn: vehicle.firstRegisteredOn,
    mileageKm: vehicle.mileageKm,
    seats: vehicle.seats,
    horsepowerPs: vehicle.horsepowerPs,
    transmission: vehicle.transmission,
    fuel: vehicle.fuel,
    engineModel: vehicle.engineModel,
    displacementCc: vehicle.displacementCc,
    steering: vehicle.steering,
    longBody: vehicle.longBody,
    transferType: vehicle.transferType,
    lengthMm: vehicle.lengthMm,
    widthMm: vehicle.widthMm,
    heightMm: vehicle.heightMm,
    previousUseKo: vehicle.previousUseKo,
    previousUseEn: vehicle.previousUseEn,
    location: vehicle.location,
    maintenanceKo: vehicle.maintenanceKo,
    maintenanceEn: vehicle.maintenanceEn,
    defectsKo: vehicle.defectsKo,
    defectsEn: vehicle.defectsEn,
    descriptionKo: vehicle.descriptionKo,
    descriptionEn: vehicle.descriptionEn,
    photographedOn: vehicle.photographedOn,
    stockCheckedOn: vehicle.stockCheckedOn,
    featured: vehicle.featured,
    domesticPriceKrw: vehicle.domesticPriceKrw,
    exportPriceAmount: vehicle.exportPriceAmount,
    exportPriceCurrency: vehicle.exportPriceCurrency,
    exportPriceTermsKo: vehicle.exportPriceTermsKo,
    exportPriceTermsEn: vehicle.exportPriceTermsEn,
    videoUrl: vehicle.videoUrl,
    photos: vehicle.photos,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
    demo: vehicle.demo,
  };
  return publicVehicle;
}

export function toOwnedListing(vehicle: AdminVehicle): OwnedListing {
  return {
    id: vehicle.id,
    stockNo: vehicle.stockNo,
    status: vehicle.status,
    vehicleClass: vehicle.vehicleClass,
    maker: vehicle.maker,
    model: vehicle.model,
    trim: vehicle.trim,
    modelYear: vehicle.modelYear,
    firstRegisteredOn: vehicle.firstRegisteredOn,
    mileageKm: vehicle.mileageKm,
    seats: vehicle.seats,
    horsepowerPs: vehicle.horsepowerPs,
    transmission: vehicle.transmission,
    fuel: vehicle.fuel,
    engineModel: vehicle.engineModel,
    displacementCc: vehicle.displacementCc,
    steering: vehicle.steering,
    longBody: vehicle.longBody,
    transferType: vehicle.transferType,
    lengthMm: vehicle.lengthMm,
    widthMm: vehicle.widthMm,
    heightMm: vehicle.heightMm,
    previousUseKo: vehicle.previousUseKo,
    previousUseEn: vehicle.previousUseEn,
    location: vehicle.location,
    maintenanceKo: vehicle.maintenanceKo,
    maintenanceEn: vehicle.maintenanceEn,
    defectsKo: vehicle.defectsKo,
    defectsEn: vehicle.defectsEn,
    descriptionKo: vehicle.descriptionKo,
    descriptionEn: vehicle.descriptionEn,
    photographedOn: vehicle.photographedOn,
    stockCheckedOn: vehicle.stockCheckedOn,
    featured: vehicle.featured,
    domesticPriceKrw: vehicle.domesticPriceKrw,
    exportPriceAmount: vehicle.exportPriceAmount,
    exportPriceCurrency: vehicle.exportPriceCurrency,
    exportPriceTermsKo: vehicle.exportPriceTermsKo,
    exportPriceTermsEn: vehicle.exportPriceTermsEn,
    videoUrl: vehicle.videoUrl,
    photos: vehicle.photos,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt,
    demo: vehicle.demo,
    listingSource: vehicle.listingSource,
  };
}

export function publicJson(vehicle: AdminVehicle): string | null {
  const pub = toPublicVehicle(vehicle);
  if (!pub) return null;
  return JSON.stringify(pub);
}

export function containsInternalKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsInternalKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, nested]) => {
    if ((internalNames as readonly string[]).includes(key)) return true;
    return containsInternalKey(nested);
  });
}

export function toAgentReferral(inquiry: Inquiry): AgentReferral {
  return {
    id: inquiry.id,
    createdAt: inquiry.createdAt,
    stockNo: inquiry.stockNo,
    tradeMode: inquiry.tradeMode,
    status: inquiry.status,
  };
}

export function visibleReferrals(inquiries: Inquiry[], agent: Pick<Agent, "status" | "referralCode">): AgentReferral[] {
  if (agent.status !== "approved") return [];
  return inquiries
    .filter((inquiry) => inquiry.firstReferralCode === agent.referralCode)
    .map(toAgentReferral);
}

export function referralLeakKeys(view: AgentReferral): string[] {
  return Object.keys(view);
}

export function inquiryViewerRole(
  inquiry: Inquiry,
  viewer: { memberId: string | null; email: string | null; admin?: boolean },
  ownerId: string | null,
): InquiryMessageAuthor | null {
  if (viewer.admin) return "staff";
  if (viewer.memberId && ownerId && viewer.memberId === ownerId) return "seller";
  if (viewer.memberId && inquiry.memberId && viewer.memberId === inquiry.memberId) return "buyer";
  const viewerEmail = viewer.email?.trim().toLowerCase() ?? "";
  const inquiryEmail = inquiry.email?.trim().toLowerCase() ?? "";
  if (viewerEmail && inquiryEmail && viewerEmail === inquiryEmail) return "buyer";
  return null;
}

export function toInquiryThreadSummary(
  inquiry: Inquiry,
  messages: InquiryMessage[],
  viewerRole: InquiryMessageAuthor,
): InquiryThreadSummary {
  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const last = sorted.at(-1);
  return {
    id: inquiry.id,
    kind: inquiry.kind,
    tradeMode: inquiry.tradeMode,
    stockNo: inquiry.stockNo,
    status: inquiry.status,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    lastMessageAt: last?.createdAt ?? inquiry.updatedAt,
    lastMessagePreview: (last?.body ?? inquiry.message).slice(0, 120),
    viewerRole,
  };
}
