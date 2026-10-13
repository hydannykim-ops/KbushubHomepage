import type { Currency, InquiryKind, TradeMode } from "./types";

export type Raw = Record<string, string | undefined>;
export type Errors = Record<string, string>;

export type ParsedInquiry = {
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
};

const DOMESTIC_KINDS: InquiryKind[] = ["purchase", "visit", "similar", "general"];
const EXPORT_KINDS: InquiryKind[] = ["quote", "video", "similar", "general"];

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

export function parseInquiry(
  raw: Raw,
): { ok: true; value: ParsedInquiry } | { ok: false; errors: Errors } {
  const errors: Errors = {};
  if (clean(raw.company_website)) {
    return { ok: false, errors: { form: "rejected" } };
  }
  const name = clean(raw.name);
  const contact = clean(raw.contact);
  const message = clean(raw.message);
  const trade = clean(raw.trade);
  const kind = clean(raw.kind);
  const country = clean(raw.country);
  const vehicleId = clean(raw.vehicleId);
  const destinationCountry = clean(raw.destinationCountry);
  const destinationPort = clean(raw.destinationPort);
  const portUndecided = raw.portUndecided === "yes";
  const consent = raw.consent === "yes";

  if (!name || name.length > 80) errors.name = "required";
  if (contact.length < 3 || contact.length > 120) errors.contact = "contact";
  if (!message || message.length > 2000) errors.message = message ? "length" : "required";
  if (trade !== "domestic" && trade !== "export") errors.trade = "required";
  if (!consent) errors.consent = "consent";
  if (country.length > 80) errors.country = "length";

  const allowed = trade === "export" ? EXPORT_KINDS : DOMESTIC_KINDS;
  if (!allowed.includes(kind as InquiryKind)) errors.kind = "kind";

  if (vehicleId && !/^[A-Za-z0-9-]{4,24}$/.test(vehicleId)) errors.vehicleId = "invalid";

  if (trade === "export" && (kind === "quote" || kind === "video" || kind === "similar")) {
    if (!destinationCountry || destinationCountry.length > 80) errors.destinationCountry = "country";
    if (!portUndecided && !destinationPort) errors.destinationPort = "port";
    if (destinationPort.length > 80) errors.destinationPort = "length";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      contact,
      trade: trade as TradeMode,
      country,
      vehicleId: vehicleId || null,
      message,
      kind: kind as InquiryKind,
      destinationCountry: destinationCountry || null,
      destinationPort: portUndecided ? null : destinationPort || null,
      portUndecided,
    },
  };
}

export type ParsedRequest = {
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
};

function optionalNumber(value: string, field: string, errors: Errors): number | null {
  if (!value) return null;
  if (!/^\d+(\.\d+)?$/.test(value)) {
    errors[field] = "invalid";
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    errors[field] = "invalid";
    return null;
  }
  return parsed;
}

function currencyOf(value: string): Currency | null {
  if (value === "KRW" || value === "USD" || value === "EUR") return value;
  return null;
}

export function parseRequest(
  raw: Raw,
): { ok: true; value: ParsedRequest } | { ok: false; errors: Errors } {
  const errors: Errors = {};
  if (clean(raw.company_website)) return { ok: false, errors: { form: "rejected" } };
  const model = clean(raw.model);
  const contactName = clean(raw.contactName);
  const contact = clean(raw.contact);
  const country = clean(raw.country);
  const timing = clean(raw.timing);
  const currency = currencyOf(clean(raw.budgetCurrency) || "KRW");
  if (!model || model.length > 80) errors.model = "required";
  if (!contactName || contactName.length > 80) errors.contactName = "required";
  if (contact.length < 3 || contact.length > 120) errors.contact = "contact";
  if (!country || country.length > 80) errors.country = "country";
  if (timing.length > 80) errors.timing = "length";
  if (!currency) errors.budgetCurrency = "currency";
  if (raw.consent !== "yes") errors.consent = "consent";
  const budgetAmount = optionalNumber(clean(raw.budgetAmount), "budgetAmount", errors);
  const yearFrom = optionalNumber(clean(raw.yearFrom), "yearFrom", errors);
  const yearTo = optionalNumber(clean(raw.yearTo), "yearTo", errors);
  const seats = optionalNumber(clean(raw.seats), "seats", errors);
  const quantity = optionalNumber(clean(raw.quantity), "quantity", errors);
  if (quantity == null || quantity < 1) errors.quantity = "required";
  if (Object.keys(errors).length || !currency || quantity == null) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      model,
      budgetAmount,
      budgetCurrency: currency,
      yearFrom,
      yearTo,
      seats,
      quantity,
      country,
      timing,
      contactName,
      contact,
    },
  };
}

export type ParsedSell = {
  model: string;
  year: number | null;
  mileageKm: number | null;
  location: string;
  askingAmount: number | null;
  askingCurrency: Currency;
  contactName: string;
  contact: string;
  note: string;
};

export function parseSell(
  raw: Raw,
): { ok: true; value: ParsedSell } | { ok: false; errors: Errors } {
  const errors: Errors = {};
  if (clean(raw.company_website)) return { ok: false, errors: { form: "rejected" } };
  const model = clean(raw.model);
  const location = clean(raw.location);
  const contactName = clean(raw.contactName);
  const contact = clean(raw.contact);
  const note = clean(raw.note);
  const currency = currencyOf(clean(raw.askingCurrency) || "KRW");
  if (!model || model.length > 80) errors.model = "required";
  if (!location || location.length > 80) errors.location = "required";
  if (!contactName || contactName.length > 80) errors.contactName = "required";
  if (contact.length < 3 || contact.length > 120) errors.contact = "contact";
  if (note.length > 2000) errors.note = "length";
  if (!currency) errors.askingCurrency = "currency";
  if (raw.consent !== "yes") errors.consent = "consent";
  const year = optionalNumber(clean(raw.year), "year", errors);
  const mileageKm = optionalNumber(clean(raw.mileageKm), "mileageKm", errors);
  const askingAmount = optionalNumber(clean(raw.askingAmount), "askingAmount", errors);
  if (Object.keys(errors).length || !currency) return { ok: false, errors };
  return {
    ok: true,
    value: {
      model,
      year,
      mileageKm,
      location,
      askingAmount,
      askingCurrency: currency,
      contactName,
      contact,
      note,
    },
  };
}

export type ParsedAgent = {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  note: string;
  password: string;
};

export function parseAgentApply(
  raw: Raw,
): { ok: true; value: ParsedAgent } | { ok: false; errors: Errors } {
  const errors: Errors = {};
  if (clean(raw.company_website)) return { ok: false, errors: { form: "rejected" } };
  const name = clean(raw.name);
  const company = clean(raw.company);
  const email = clean(raw.email).toLowerCase();
  const phone = clean(raw.phone);
  const country = clean(raw.country);
  const note = clean(raw.note);
  const password = raw.password ?? "";
  if (!name || name.length > 80) errors.name = "required";
  if (!company || company.length > 80) errors.company = "required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "invalid";
  if (phone.length < 3 || phone.length > 40) errors.phone = "contact";
  if (!country || country.length > 80) errors.country = "country";
  if (note.length > 1000) errors.note = "length";
  if (password.length < 8 || password.length > 80) errors.password = "invalid";
  if (raw.consent !== "yes") errors.consent = "consent";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, company, email, phone, country, note, password } };
}

export function blankToNull(value: string): number | null | "invalid" {
  if (!value) return null;
  if (!/^\d+(\.\d+)?$/.test(value)) return "invalid";
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return "invalid";
  return parsed;
}

export function formToRaw(formData: FormData): Raw {
  const raw: Raw = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && raw[key] === undefined) raw[key] = value;
  }
  return raw;
}
