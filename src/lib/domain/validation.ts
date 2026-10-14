import { z } from "zod";
import type {
  Fuel,
  InquiryKind,
  Lang,
  PhotoCategory,
  SaleStatus,
  Steering,
  TradeMode,
  Transmission,
  VehicleClass,
} from "./types";
import { knownMakerModel } from "./vehicle-catalog";

export type FieldErrors = Record<string, string>;

const classes = ["county", "medium", "large"] as const;
const transmissions = ["manual", "automatic", "unknown"] as const;
const fuels = ["diesel", "gasoline", "lpg", "cng", "electric", "hybrid", "unknown"] as const;
const steerings = ["lhd", "rhd", "unknown"] as const;
const statuses = ["available", "reserved", "sold", "hidden", "review"] as const;
const photoCategories = ["front", "front_side", "rear", "exterior", "interior", "dashboard", "engine", "tires", "defect"] as const;
const inquiryKinds = ["purchase", "visit", "quote", "video", "general"] as const;
const inquiryStatuses = ["new", "consulting", "quoted", "negotiating", "contracted", "closed"] as const;
const modes = ["domestic", "export"] as const;
const langs = ["ko", "en"] as const;
const moneyStatuses = ["amount", "zero", "unknown"] as const;
const currencies = ["KRW", "USD", "EUR", "JPY", "CNY", "AED"] as const;

function text(lang: Lang, ko: string, en: string): string {
  return lang === "ko" ? ko : en;
}

function fieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function optionalText(max: number) {
  return z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      const trimmed = value?.trim() ?? "";
      return trimmed ? trimmed : null;
    })
    .refine((value) => value == null || value.length <= max);
}

function optionalInt(min: number, max: number) {
  return z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return null;
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === null || (Number.isInteger(value) && value >= min && value <= max));
}

function optionalNumber(min: number, max: number) {
  return z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((value) => {
      if (value == null || value === "") return null;
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === null || (value >= min && value <= max));
}

function optionalBool() {
  return z
    .union([z.boolean(), z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value == null || value === "") return null;
      if (value === true || value === "true" || value === "yes" || value === "1") return true;
      if (value === false || value === "false" || value === "no" || value === "0") return false;
      return null;
    });
}

export type InquiryInput = {
  kind: InquiryKind;
  tradeMode: TradeMode;
  name: string;
  email: string | null;
  phone: string | null;
  messenger: string | null;
  country: string;
  stockNo: string | null;
  message: string;
  destinationCountry: string | null;
  destinationPort: string | null;
  destinationPortUndecided: boolean;
  consent: boolean;
  companyWebsite: string;
  lang: Lang;
};

export function parseInquiry(body: unknown, lang: Lang): { ok: true; data: InquiryInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      kind: z.enum(inquiryKinds),
      tradeMode: z.enum(modes),
      name: z.string().trim().min(1, text(lang, "이름을 입력해 주세요.", "Enter your name.")).max(80),
      email: z.string().trim().max(120).optional().or(z.literal("")),
      phone: z.string().trim().max(40).optional().or(z.literal("")),
      messenger: z.string().trim().max(80).optional().or(z.literal("")),
      country: z.string().trim().min(1, text(lang, "국가를 입력해 주세요.", "Enter a country.")).max(80),
      stockNo: z.string().trim().max(40).optional().or(z.literal("")),
      message: z.string().trim().min(1, text(lang, "문의 내용을 입력해 주세요.", "Enter a message.")).max(4000),
      destinationCountry: z.string().trim().max(80).optional().or(z.literal("")),
      destinationPort: z.string().trim().max(80).optional().or(z.literal("")),
      destinationPortUndecided: z.union([z.boolean(), z.string()]).optional(),
      consent: z.union([z.boolean(), z.string()]),
      companyWebsite: z.string().optional(),
      lang: z.enum(langs).optional(),
    })
    .superRefine((value, ctx) => {
      const email = value.email?.trim() ?? "";
      const phone = value.phone?.trim() ?? "";
      const messenger = value.messenger?.trim() ?? "";
      if (!email && !phone && !messenger) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: text(lang, "이메일, 전화, 메신저 중 하나를 입력해 주세요.", "Enter an email, phone, or messenger contact."),
        });
      }
      if (email && !z.email().safeParse(email).success) {
        ctx.addIssue({ code: "custom", path: ["email"], message: text(lang, "이메일 형식을 확인해 주세요.", "Check the email format.") });
      }
      const consent = value.consent === true || value.consent === "true" || value.consent === "on" || value.consent === "1";
      if (!consent) {
        ctx.addIssue({ code: "custom", path: ["consent"], message: text(lang, "안내를 확인하고 동의해 주세요.", "Please confirm the notice.") });
      }
      if ((value.companyWebsite ?? "").trim() !== "") {
        ctx.addIssue({ code: "custom", path: ["form"], message: "invalid" });
      }
      const exportLike = value.tradeMode === "export" || value.kind === "quote";
      if (exportLike && !(value.destinationCountry ?? "").trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationCountry"],
          message: text(lang, "목적국을 입력해 주세요.", "Enter the destination country."),
        });
      }
      const undecided = value.destinationPortUndecided === true || value.destinationPortUndecided === "true" || value.destinationPortUndecided === "on";
      if (exportLike && !undecided && !(value.destinationPort ?? "").trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["destinationPort"],
          message: text(lang, "목적항을 입력하거나 미정을 선택해 주세요.", "Enter a destination port or mark it as undecided."),
        });
      }
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const value = parsed.data;
  const undecided = value.destinationPortUndecided === true || value.destinationPortUndecided === "true" || value.destinationPortUndecided === "on";
  return {
    ok: true,
    data: {
      kind: value.kind,
      tradeMode: value.tradeMode,
      name: value.name,
      email: value.email?.trim() || null,
      phone: value.phone?.trim() || null,
      messenger: value.messenger?.trim() || null,
      country: value.country,
      stockNo: value.stockNo?.trim() || null,
      message: value.message,
      destinationCountry: value.destinationCountry?.trim() || null,
      destinationPort: undecided ? null : value.destinationPort?.trim() || null,
      destinationPortUndecided: undecided,
      consent: true,
      companyWebsite: "",
      lang,
    },
  };
}

export type WantedInput = {
  model: string;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  modelYear: number | null;
  seats: number | null;
  quantity: number;
  destinationCountry: string;
  desiredTime: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  consent: boolean;
  companyWebsite: string;
};

export function parseWanted(body: unknown, lang: Lang): { ok: true; data: WantedInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      model: z.string().trim().min(1).max(80),
      budgetAmount: optionalNumber(0, 1_000_000_000),
      budgetCurrency: z.union([z.string(), z.null()]).optional(),
      modelYear: optionalInt(1980, 2035),
      seats: optionalInt(1, 80),
      quantity: z.union([z.string(), z.number()]).transform((value) => Number(value)),
      destinationCountry: z.string().trim().min(1).max(80),
      desiredTime: optionalText(80),
      name: z.string().trim().min(1).max(80),
      email: z.string().trim().max(120).optional().or(z.literal("")),
      phone: z.string().trim().max(40).optional().or(z.literal("")),
      message: optionalText(4000),
      consent: z.union([z.boolean(), z.string()]),
      companyWebsite: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (!Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 100) {
        ctx.addIssue({ code: "custom", path: ["quantity"], message: text(lang, "필요 대수를 확인해 주세요.", "Check the quantity.") });
      }
      const email = value.email?.trim() ?? "";
      const phone = value.phone?.trim() ?? "";
      if (!email && !phone) {
        ctx.addIssue({ code: "custom", path: ["email"], message: text(lang, "이메일 또는 전화를 입력해 주세요.", "Enter an email or phone.") });
      }
      if (email && !z.email().safeParse(email).success) {
        ctx.addIssue({ code: "custom", path: ["email"], message: text(lang, "이메일 형식을 확인해 주세요.", "Check the email format.") });
      }
      if (value.budgetAmount != null && !(value.budgetCurrency ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["budgetCurrency"], message: text(lang, "예산 통화를 선택해 주세요.", "Choose a budget currency.") });
      }
      const consent = value.consent === true || value.consent === "true" || value.consent === "on";
      if (!consent) ctx.addIssue({ code: "custom", path: ["consent"], message: text(lang, "안내를 확인하고 동의해 주세요.", "Please confirm the notice.") });
      if ((value.companyWebsite ?? "").trim()) ctx.addIssue({ code: "custom", path: ["form"], message: "invalid" });
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const value = parsed.data;
  return {
    ok: true,
    data: {
      model: value.model,
      budgetAmount: value.budgetAmount,
      budgetCurrency: value.budgetCurrency?.trim().toUpperCase() || null,
      modelYear: value.modelYear,
      seats: value.seats,
      quantity: value.quantity,
      destinationCountry: value.destinationCountry,
      desiredTime: value.desiredTime,
      name: value.name,
      email: value.email?.trim() || null,
      phone: value.phone?.trim() || null,
      message: value.message,
      consent: true,
      companyWebsite: "",
    },
  };
}

export type SellInput = {
  model: string;
  modelYear: number | null;
  mileageKm: number | null;
  location: string;
  askingPriceAmount: number | null;
  askingPriceCurrency: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  consent: boolean;
  companyWebsite: string;
};

export function parseSell(body: unknown, lang: Lang): { ok: true; data: SellInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      model: z.string().trim().min(1).max(80),
      modelYear: optionalInt(1980, 2035),
      mileageKm: optionalInt(0, 5_000_000),
      location: z.string().trim().min(1).max(120),
      askingPriceAmount: optionalNumber(0, 1_000_000_000),
      askingPriceCurrency: z.union([z.string(), z.null()]).optional(),
      name: z.string().trim().min(1).max(80),
      email: z.string().trim().max(120).optional().or(z.literal("")),
      phone: z.string().trim().max(40).optional().or(z.literal("")),
      message: optionalText(4000),
      consent: z.union([z.boolean(), z.string()]),
      companyWebsite: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      const email = value.email?.trim() ?? "";
      const phone = value.phone?.trim() ?? "";
      if (!email && !phone) ctx.addIssue({ code: "custom", path: ["email"], message: text(lang, "이메일 또는 전화를 입력해 주세요.", "Enter an email or phone.") });
      if (email && !z.email().safeParse(email).success) ctx.addIssue({ code: "custom", path: ["email"], message: text(lang, "이메일 형식을 확인해 주세요.", "Check the email format.") });
      if (value.askingPriceAmount != null && !(value.askingPriceCurrency ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["askingPriceCurrency"], message: text(lang, "희망 가격 통화를 선택해 주세요.", "Choose a currency.") });
      }
      const consent = value.consent === true || value.consent === "true" || value.consent === "on";
      if (!consent) ctx.addIssue({ code: "custom", path: ["consent"], message: text(lang, "안내를 확인하고 동의해 주세요.", "Please confirm the notice.") });
      if ((value.companyWebsite ?? "").trim()) ctx.addIssue({ code: "custom", path: ["form"], message: "invalid" });
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const value = parsed.data;
  return {
    ok: true,
    data: {
      model: value.model,
      modelYear: value.modelYear,
      mileageKm: value.mileageKm,
      location: value.location,
      askingPriceAmount: value.askingPriceAmount,
      askingPriceCurrency: value.askingPriceCurrency?.trim().toUpperCase() || null,
      name: value.name,
      email: value.email?.trim() || null,
      phone: value.phone?.trim() || null,
      message: value.message,
      consent: true,
      companyWebsite: "",
    },
  };
}

export type PartnerInput = {
  name: string;
  company: string | null;
  country: string;
  email: string;
  phone: string | null;
  message: string | null;
  consent: boolean;
  companyWebsite: string;
};

export function parsePartner(body: unknown, lang: Lang): { ok: true; data: PartnerInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      name: z.string().trim().min(1).max(80),
      company: optionalText(120),
      country: z.string().trim().min(1).max(80),
      email: z.string().trim().max(120),
      phone: z.string().trim().max(40).optional().or(z.literal("")),
      message: optionalText(2000),
      consent: z.union([z.boolean(), z.string()]),
      companyWebsite: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (!z.email().safeParse(value.email).success) {
        ctx.addIssue({ code: "custom", path: ["email"], message: text(lang, "이메일 형식을 확인해 주세요.", "Check the email format.") });
      }
      const consent = value.consent === true || value.consent === "true" || value.consent === "on";
      if (!consent) ctx.addIssue({ code: "custom", path: ["consent"], message: text(lang, "안내를 확인하고 동의해 주세요.", "Please confirm the notice.") });
      if ((value.companyWebsite ?? "").trim()) ctx.addIssue({ code: "custom", path: ["form"], message: "invalid" });
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return {
    ok: true,
    data: {
      name: parsed.data.name,
      company: parsed.data.company,
      country: parsed.data.country,
      email: parsed.data.email.trim(),
      phone: parsed.data.phone?.trim() || null,
      message: parsed.data.message,
      consent: true,
      companyWebsite: "",
    },
  };
}

const lineSchema = z.object({
  status: z.enum(moneyStatuses),
  amount: z.union([z.number(), z.null()]),
});

export type QuoteInput = {
  inquiryId: string;
  currency: string;
  lines: Record<(typeof moneyStatuses extends never ? never : "vehiclePrice"), { status: "amount" | "zero" | "unknown"; amount: number | null }> & {
    vehiclePrice: { status: "amount" | "zero" | "unknown"; amount: number | null };
    domesticTransport: { status: "amount" | "zero" | "unknown"; amount: number | null };
    exportCosts: { status: "amount" | "zero" | "unknown"; amount: number | null };
    oceanFreight: { status: "amount" | "zero" | "unknown"; amount: number | null };
    otherCosts: { status: "amount" | "zero" | "unknown"; amount: number | null };
  };
  includedItems: string | null;
  excludedItems: string | null;
  tradeTerms: string | null;
  validUntil: string | null;
};

function cleanLine(status: "amount" | "zero" | "unknown", amount: number | null) {
  if (status === "unknown") return { status, amount: null as number | null };
  if (status === "zero") return { status, amount: 0 as number | null };
  return { status, amount };
}

function lineError(status: "amount" | "zero" | "unknown", amount: number | null): boolean {
  return status === "amount" && (amount == null || !(amount > 0));
}

export function parseQuote(body: unknown): { ok: true; data: QuoteInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      inquiryId: z.string().uuid().or(z.string().min(4).max(80)),
      currency: z.enum(currencies),
      lines: z.object({
        vehiclePrice: lineSchema,
        domesticTransport: lineSchema,
        exportCosts: lineSchema,
        oceanFreight: lineSchema,
        otherCosts: lineSchema,
      }),
      includedItems: optionalText(2000),
      excludedItems: optionalText(2000),
      tradeTerms: optionalText(2000),
      validUntil: z.string().trim().optional().or(z.literal("")).transform((value) => (value ? value : null)),
    })
    .superRefine((value, ctx) => {
      for (const key of ["vehiclePrice", "domesticTransport", "exportCosts", "oceanFreight", "otherCosts"] as const) {
        if (lineError(value.lines[key].status, value.lines[key].amount)) {
          ctx.addIssue({ code: "custom", path: [key], message: "Enter an amount greater than zero, or mark the line as zero or unknown." });
        }
      }
      if (value.validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(value.validUntil)) {
        ctx.addIssue({ code: "custom", path: ["validUntil"], message: "Use YYYY-MM-DD." });
      }
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const lines = {
    vehiclePrice: cleanLine(parsed.data.lines.vehiclePrice.status, parsed.data.lines.vehiclePrice.amount),
    domesticTransport: cleanLine(parsed.data.lines.domesticTransport.status, parsed.data.lines.domesticTransport.amount),
    exportCosts: cleanLine(parsed.data.lines.exportCosts.status, parsed.data.lines.exportCosts.amount),
    oceanFreight: cleanLine(parsed.data.lines.oceanFreight.status, parsed.data.lines.oceanFreight.amount),
    otherCosts: cleanLine(parsed.data.lines.otherCosts.status, parsed.data.lines.otherCosts.amount),
  };
  return { ok: true, data: { ...parsed.data, lines } };
}

export type VehicleInput = {
  stockNo: string;
  status: SaleStatus;
  vehicleClass: VehicleClass;
  maker: string;
  model: string;
  trim: string | null;
  modelYear: number | null;
  firstRegisteredOn: string | null;
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
  internal: {
    purchaseCost: number | null;
    purchaseCurrency: string | null;
    actualSaleAmount: number | null;
    saleCurrency: string | null;
    extraCosts: number | null;
    agentFee: number | null;
    feeCurrency: string | null;
    note: string | null;
  };
};

function optionalDate() {
  return z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null))
    .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function parseVehicle(body: unknown): { ok: true; data: VehicleInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      stockNo: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9-]{2,30}$/),
      status: z.enum(statuses),
      vehicleClass: z.enum(classes),
      maker: z.string().trim().min(1).max(80),
      model: z.string().trim().min(1).max(80),
      trim: optionalText(80),
      modelYear: optionalInt(1980, 2035),
      firstRegisteredOn: optionalDate(),
      mileageKm: optionalInt(0, 5_000_000),
      seats: optionalInt(1, 80),
      transmission: z.enum(transmissions),
      fuel: z.enum(fuels),
      engineModel: optionalText(80),
      displacementCc: optionalInt(0, 30_000),
      steering: z.enum(steerings),
      longBody: optionalBool(),
      lengthMm: optionalInt(1000, 20000),
      widthMm: optionalInt(1000, 4000),
      heightMm: optionalInt(1000, 5000),
      previousUseKo: optionalText(200),
      previousUseEn: optionalText(200),
      location: optionalText(120),
      maintenanceKo: optionalText(4000),
      maintenanceEn: optionalText(4000),
      defectsKo: optionalText(4000),
      defectsEn: optionalText(4000),
      descriptionKo: optionalText(8000),
      descriptionEn: optionalText(8000),
      photographedOn: optionalDate(),
      stockCheckedOn: optionalDate(),
      featured: z.union([z.boolean(), z.string()]).optional(),
      domesticPriceKrw: optionalInt(0, 5_000_000_000),
      exportPriceAmount: optionalNumber(0, 5_000_000_000),
      exportPriceCurrency: z.union([z.string(), z.null()]).optional(),
      exportPriceTermsKo: optionalText(400),
      exportPriceTermsEn: optionalText(400),
      videoUrl: z.union([z.string(), z.null()]).optional(),
      internal: z
        .object({
          purchaseCost: optionalNumber(0, 5_000_000_000),
          purchaseCurrency: z.union([z.string(), z.null()]).optional(),
          actualSaleAmount: optionalNumber(0, 5_000_000_000),
          saleCurrency: z.union([z.string(), z.null()]).optional(),
          extraCosts: optionalNumber(0, 5_000_000_000),
          agentFee: optionalNumber(0, 5_000_000_000),
          feeCurrency: z.union([z.string(), z.null()]).optional(),
          note: optionalText(2000),
        })
        .optional(),
    })
    .superRefine((value, ctx) => {
      const currency = value.exportPriceCurrency?.trim().toUpperCase() || "";
      if (value.exportPriceAmount != null && !currency) {
        ctx.addIssue({ code: "custom", path: ["exportPriceCurrency"], message: "Export price needs a currency." });
      }
      if (value.exportPriceAmount == null && currency) {
        ctx.addIssue({ code: "custom", path: ["exportPriceAmount"], message: "Enter an export amount or clear the currency." });
      }
      if (value.videoUrl && value.videoUrl.trim() && !/^https:\/\//.test(value.videoUrl.trim())) {
        ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "Video links must start with https://." });
      }
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const value = parsed.data;
  const internal = value.internal;
  return {
    ok: true,
    data: {
      stockNo: value.stockNo.toUpperCase(),
      status: value.status,
      vehicleClass: value.vehicleClass,
      maker: value.maker,
      model: value.model,
      trim: value.trim,
      modelYear: value.modelYear,
      firstRegisteredOn: value.firstRegisteredOn,
      mileageKm: value.mileageKm,
      seats: value.seats,
      transmission: value.transmission,
      fuel: value.fuel,
      engineModel: value.engineModel,
      displacementCc: value.displacementCc,
      steering: value.steering,
      longBody: value.longBody,
      lengthMm: value.lengthMm,
      widthMm: value.widthMm,
      heightMm: value.heightMm,
      previousUseKo: value.previousUseKo,
      previousUseEn: value.previousUseEn,
      location: value.location,
      maintenanceKo: value.maintenanceKo,
      maintenanceEn: value.maintenanceEn,
      defectsKo: value.defectsKo,
      defectsEn: value.defectsEn,
      descriptionKo: value.descriptionKo,
      descriptionEn: value.descriptionEn,
      photographedOn: value.photographedOn,
      stockCheckedOn: value.stockCheckedOn,
      featured: value.featured === true || value.featured === "true" || value.featured === "on",
      domesticPriceKrw: value.domesticPriceKrw,
      exportPriceAmount: value.exportPriceAmount,
      exportPriceCurrency: value.exportPriceAmount == null ? null : value.exportPriceCurrency?.trim().toUpperCase() || null,
      exportPriceTermsKo: value.exportPriceTermsKo,
      exportPriceTermsEn: value.exportPriceTermsEn,
      videoUrl: value.videoUrl?.trim() || null,
      internal: {
        purchaseCost: internal?.purchaseCost ?? null,
        purchaseCurrency: internal?.purchaseCurrency?.trim().toUpperCase() || null,
        actualSaleAmount: internal?.actualSaleAmount ?? null,
        saleCurrency: internal?.saleCurrency?.trim().toUpperCase() || null,
        extraCosts: internal?.extraCosts ?? null,
        agentFee: internal?.agentFee ?? null,
        feeCurrency: internal?.feeCurrency?.trim().toUpperCase() || null,
        note: internal?.note ?? null,
      },
    },
  };
}

export function parseSettings(body: unknown): { ok: true; data: SettingsInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      companyName: z.string().trim().min(1).max(80),
      phone: z.string().trim().max(30).optional().or(z.literal("")),
      kakaoUrl: z.string().trim().max(300).optional().or(z.literal("")),
      whatsappE164: z.string().trim().max(20).optional().or(z.literal("")),
      email: z.string().trim().max(120).optional().or(z.literal("")),
      address: optionalText(200),
      businessHours: optionalText(120),
      aboutKo: optionalText(2000),
      aboutEn: optionalText(2000),
      privacyPolicyKo: optionalText(20000),
      privacyPolicyEn: optionalText(20000),
      privacyCollectionEnabled: z.union([z.boolean(), z.string()]).optional(),
    })
    .superRefine((value, ctx) => {
      const phone = value.phone?.trim() ?? "";
      if (phone && !/^[0-9+()\-\s]{8,20}$/.test(phone)) ctx.addIssue({ code: "custom", path: ["phone"], message: "Check the phone number." });
      const kakao = value.kakaoUrl?.trim() ?? "";
      if (kakao && !/^https:\/\/.+/.test(kakao)) ctx.addIssue({ code: "custom", path: ["kakaoUrl"], message: "Kakao URL must start with https://." });
      const wa = value.whatsappE164?.trim() ?? "";
      if (wa && !/^[1-9][0-9]{7,14}$/.test(wa)) ctx.addIssue({ code: "custom", path: ["whatsappE164"], message: "Use country code digits only, without +." });
      const email = value.email?.trim() ?? "";
      if (email && !z.email().safeParse(email).success) ctx.addIssue({ code: "custom", path: ["email"], message: "Check the email format." });
      const enabled = value.privacyCollectionEnabled === true || value.privacyCollectionEnabled === "true" || value.privacyCollectionEnabled === "on";
      if (enabled && ((value.privacyPolicyKo ?? "").trim().length < 40 || (value.privacyPolicyEn ?? "").trim().length < 40)) {
        ctx.addIssue({
          code: "custom",
          path: ["privacyCollectionEnabled"],
          message: "Write Korean and English privacy policies before enabling collection.",
        });
      }
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const value = parsed.data;
  return {
    ok: true,
    data: {
      companyName: value.companyName,
      phone: value.phone?.trim() || null,
      kakaoUrl: value.kakaoUrl?.trim() || null,
      whatsappE164: value.whatsappE164?.trim() || null,
      email: value.email?.trim() || null,
      address: value.address,
      businessHours: value.businessHours,
      aboutKo: value.aboutKo,
      aboutEn: value.aboutEn,
      privacyPolicyKo: value.privacyPolicyKo,
      privacyPolicyEn: value.privacyPolicyEn,
      privacyCollectionEnabled:
        value.privacyCollectionEnabled === true || value.privacyCollectionEnabled === "true" || value.privacyCollectionEnabled === "on",
    },
  };
}

export type SettingsInput = {
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
};

export function parseInquiryUpdate(body: unknown): { ok: true; data: InquiryUpdate } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      status: z.enum(inquiryStatuses),
      staffMemo: optionalText(4000),
      closeReason: optionalText(400),
      assignedAgentId: z.string().trim().max(80).optional().or(z.literal("")).transform((value) => (value ? value : null)),
      assignmentReason: z.string().trim().max(400).optional().or(z.literal("")),
    })
    .superRefine((value, ctx) => {
      if (value.status === "closed" && !(value.closeReason ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["closeReason"], message: "A close reason is required." });
      }
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return {
    ok: true,
    data: {
      status: parsed.data.status,
      staffMemo: parsed.data.staffMemo,
      closeReason: parsed.data.closeReason,
      assignedAgentId: parsed.data.assignedAgentId,
      assignmentReason: parsed.data.assignmentReason?.trim() || null,
    },
  };
}

export type InquiryUpdate = {
  status: (typeof inquiryStatuses)[number];
  staffMemo: string | null;
  closeReason: string | null;
  assignedAgentId: string | null;
  assignmentReason: string | null;
};

export function parseAgentUpdate(body: unknown): { ok: true; data: { status: "pending" | "approved" | "rejected" | "suspended"; userId: string | null } } | { ok: false; errors: FieldErrors } {
  const schema = z.object({
    status: z.enum(["pending", "approved", "rejected", "suspended"]),
    userId: z
      .string()
      .trim()
      .max(80)
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : null)),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return { ok: true, data: parsed.data };
}

export function parseRequestUpdate(body: unknown): { ok: true; data: { status: "new" | "consulting" | "closed"; staffMemo: string | null } } | { ok: false; errors: FieldErrors } {
  const schema = z.object({
    status: z.enum(["new", "consulting", "closed"]),
    staffMemo: optionalText(4000),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return { ok: true, data: { status: parsed.data.status, staffMemo: parsed.data.staffMemo } };
}

export function parsePhotoPatch(body: unknown): { ok: true; data: { category?: PhotoCategory; sortOrder?: number; isCover?: boolean; altKo?: string; altEn?: string } } | { ok: false; errors: FieldErrors } {
  const schema = z.object({
    category: z.enum(photoCategories).optional(),
    sortOrder: z.number().int().min(0).max(100).optional(),
    isCover: z.boolean().optional(),
    altKo: z.string().trim().max(160).optional(),
    altEn: z.string().trim().max(160).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return { ok: true, data: parsed.data };
}

export const supportedCurrencies = currencies;

export type SignupInput = {
  role: "customer" | "dealer";
  name: string;
  email: string;
  password: string;
  phone: string | null;
  company: string | null;
  consent: boolean;
  companyWebsite: string;
};

export function parseSignup(body: unknown, lang: Lang): { ok: true; data: SignupInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      role: z.enum(["customer", "dealer"]),
      name: z.string().trim().min(1, text(lang, "이름을 입력해 주세요.", "Enter your name.")).max(80),
      email: z.string().trim().max(120),
      password: z.string().min(8, text(lang, "비밀번호는 8자 이상으로 해 주세요.", "Use at least 8 characters.")).max(80),
      phone: z.string().trim().max(40).optional().or(z.literal("")),
      company: z.string().trim().max(80).optional().or(z.literal("")),
      consent: z.union([z.boolean(), z.string()]),
      companyWebsite: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (!z.email().safeParse(value.email).success) {
        ctx.addIssue({ code: "custom", path: ["email"], message: text(lang, "이메일 형식을 확인해 주세요.", "Check the email format.") });
      }
      if (value.role === "dealer" && !(value.company ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["company"], message: text(lang, "판매 사업자는 상호를 입력해 주세요.", "Enter the business name.") });
      }
      const consent = value.consent === true || value.consent === "true" || value.consent === "on";
      if (!consent) ctx.addIssue({ code: "custom", path: ["consent"], message: text(lang, "안내를 확인하고 동의해 주세요.", "Please confirm the notice.") });
      if ((value.companyWebsite ?? "").trim()) ctx.addIssue({ code: "custom", path: ["form"], message: "invalid" });
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return {
    ok: true,
    data: {
      role: parsed.data.role,
      name: parsed.data.name,
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      phone: parsed.data.phone?.trim() || null,
      company: parsed.data.role === "dealer" ? parsed.data.company?.trim() || null : parsed.data.company?.trim() || null,
      consent: true,
      companyWebsite: "",
    },
  };
}

export type DealerListingInput = {
  vehicleClass: VehicleClass;
  maker: string;
  model: string;
  modelYear: number | null;
  mileageKm: number | null;
  seats: number | null;
  transmission: Transmission;
  fuel: Fuel;
  location: string | null;
  domesticPriceKrw: number | null;
  descriptionKo: string | null;
  descriptionEn: string | null;
};

export function parseDealerListing(body: unknown, lang: Lang): { ok: true; data: DealerListingInput } | { ok: false; errors: FieldErrors } {
  const schema = z
    .object({
      vehicleClass: z.enum(classes),
      maker: z.string().trim().min(1, text(lang, "제조사를 선택해 주세요.", "Choose a maker.")).max(80),
      model: z.string().trim().min(1, text(lang, "모델을 선택해 주세요.", "Choose a model.")).max(80),
      modelYear: optionalInt(1980, 2035),
      mileageKm: optionalInt(0, 5_000_000),
      seats: optionalInt(1, 80),
      transmission: z.enum(transmissions),
      fuel: z.enum(fuels),
      location: optionalText(120),
      domesticPriceKrw: optionalInt(0, 5_000_000_000),
      descriptionKo: optionalText(8000),
      descriptionEn: optionalText(8000),
    })
    .superRefine((value, ctx) => {
      if (!knownMakerModel(value.maker, value.model)) {
        ctx.addIssue({ code: "custom", path: ["model"], message: text(lang, "목록에서 제조사와 모델을 선택해 주세요.", "Choose a maker and model from the list.") });
      }
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return { ok: true, data: parsed.data };
}
