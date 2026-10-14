"use server";

import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  adminPasswordOk,
  clearSession,
  hashPassword,
  requireAdmin,
  verifyPassword,
  writeSession,
} from "./auth";
import { isLiveMode } from "./demo-accounts";
import { assignAgent, MAX_LISTING_PHOTOS } from "./domain";
import { emptyForm, type FormState } from "./form-state";
import { allowRequest } from "./rate-limit";
import { readDb, updateDb } from "./store";
import { POLICY_VERSION, type Currency, type PhotoCategory, type SaleStatus, type Vehicle } from "./types";
import {
  blankToNull,
  formToRaw,
  parseAgentApply,
  parseInquiry,
  parseRequest,
  parseSell,
} from "./validators";

async function clientIp() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

async function currentRef() {
  const headerStore = await headers();
  const value = headerStore.get("x-kb-ref") ?? "";
  return /^[A-Z0-9-]{4,20}$/.test(value) ? value : null;
}

function id(prefix: string) {
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function refresh() {
  revalidatePath("/", "layout");
}

async function adminOnly() {
  return Boolean(await requireAdmin());
}

async function gatePublic(): Promise<FormState | null> {
  if (isLiveMode()) return { ...emptyForm, errors: { form: "live" } };
  const ip = await clientIp();
  if (!allowRequest(ip)) return { ...emptyForm, errors: { form: "rate" } };
  return null;
}

export async function submitInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await gatePublic();
  if (blocked) return blocked;
  const parsed = parseInquiry(formToRaw(formData));
  if (!parsed.ok) return { saved: false, errors: parsed.errors };
  const ref = await currentRef();
  const inquiryId = id("INQ");
  const saved = await updateDb((db) => {
    if (parsed.value.vehicleId && !db.vehicles.some((vehicle) => vehicle.id === parsed.value.vehicleId && vehicle.status !== "hidden")) {
      parsed.value.vehicleId = null;
    }
    db.inquiries.unshift({
      id: inquiryId,
      createdAt: new Date().toISOString(),
      ...parsed.value,
      status: "new",
      staffNote: "",
      closeReason: "",
      referralCode: ref,
      assignedAgentId: null,
      referralHistory: [],
      consentAt: new Date().toISOString(),
      policyVersion: POLICY_VERSION,
      demo: true,
    });
  });
  if (!saved.ok) return { saved: false, errors: { form: "save" } };
  refresh();
  return { saved: true, id: inquiryId, errors: {} };
}

export async function submitRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await gatePublic();
  if (blocked) return blocked;
  const parsed = parseRequest(formToRaw(formData));
  if (!parsed.ok) return { saved: false, errors: parsed.errors };
  const ref = await currentRef();
  const leadId = id("LD");
  const saved = await updateDb((db) => {
    db.leads.unshift({
      id: leadId,
      type: "request",
      createdAt: new Date().toISOString(),
      ...parsed.value,
      referralCode: ref,
      consentAt: new Date().toISOString(),
      demo: true,
    });
  });
  if (!saved.ok) return { saved: false, errors: { form: "save" } };
  refresh();
  return { saved: true, id: leadId, errors: {} };
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extOf(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function submitSell(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await gatePublic();
  if (blocked) return blocked;
  const parsed = parseSell(formToRaw(formData));
  if (!parsed.ok) return { saved: false, errors: parsed.errors };
  const files = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 6) return { saved: false, errors: { photos: "fileCount" } };
  for (const file of files) {
    if (!ALLOWED.has(file.type)) return { saved: false, errors: { photos: "fileType" } };
    if (file.size > 5 * 1024 * 1024) return { saved: false, errors: { photos: "fileSize" } };
  }
  const leadId = id("LD");
  const photos: { name: string; storedAs: string; size: number }[] = [];
  if (files.length) {
    const dir = path.join(process.cwd(), "data", "private-uploads", leadId);
    await fs.mkdir(dir, { recursive: true });
    for (const file of files) {
      const storedAs = `${randomBytes(6).toString("hex")}.${extOf(file.type)}`;
      await fs.writeFile(path.join(dir, storedAs), Buffer.from(await file.arrayBuffer()));
      photos.push({ name: file.name.slice(0, 120), storedAs, size: file.size });
    }
  }
  const ref = await currentRef();
  const saved = await updateDb((db) => {
    db.leads.unshift({
      id: leadId,
      type: "sell",
      createdAt: new Date().toISOString(),
      ...parsed.value,
      photos,
      referralCode: ref,
      consentAt: new Date().toISOString(),
      demo: true,
    });
  });
  if (!saved.ok) return { saved: false, errors: { form: "save" } };
  refresh();
  return { saved: true, id: leadId, errors: {} };
}

export async function applyAgent(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await gatePublic();
  if (blocked) return blocked;
  const parsed = parseAgentApply(formToRaw(formData));
  if (!parsed.ok) return { saved: false, errors: parsed.errors };
  const agentId = id("AGT");
  const code = randomBytes(4).toString("hex").toUpperCase();
  let duplicate = false;
  const saved = await updateDb((db) => {
    if (db.agents.some((agent) => agent.email === parsed.value.email)) {
      duplicate = true;
      return;
    }
    db.agents.unshift({
      id: agentId,
      createdAt: new Date().toISOString(),
      name: parsed.value.name,
      company: parsed.value.company,
      email: parsed.value.email,
      phone: parsed.value.phone,
      country: parsed.value.country,
      note: parsed.value.note,
      passwordHash: hashPassword(parsed.value.password),
      status: "pending",
      code,
    });
  });
  if (duplicate) return { saved: false, errors: { email: "invalid" } };
  if (!saved.ok) return { saved: false, errors: { form: "save" } };
  refresh();
  return { saved: true, id: agentId, errors: {} };
}

export async function loginAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isLiveMode()) return { ...emptyForm, errors: { form: "live" } };
  const raw = formToRaw(formData);
  const lang = raw.lang === "en" ? "en" : "ko";
  if (!adminPasswordOk(raw.email?.trim() ?? "", raw.password ?? "")) {
    return { saved: false, errors: { form: "auth" } };
  }
  await writeSession({
    role: "admin",
    sub: raw.email?.trim() || "admin",
    exp: Date.now() + 1000 * 60 * 60 * 12,
  });
  redirect(`/${lang}/admin`);
}

export async function loginAgent(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isLiveMode()) return { ...emptyForm, errors: { form: "live" } };
  const raw = formToRaw(formData);
  const lang = raw.lang === "en" ? "en" : "ko";
  const email = raw.email?.trim().toLowerCase() ?? "";
  const password = raw.password ?? "";
  const loaded = await readDb();
  if (!loaded.ok) return { saved: false, errors: { form: loaded.reason === "live_not_connected" ? "live" : "save" } };
  const agent = loaded.db.agents.find((item) => item.email === email);
  if (!agent || !verifyPassword(password, agent.passwordHash)) {
    return { saved: false, errors: { form: "auth" } };
  }
  if (agent.status === "pending") return { saved: false, errors: { form: "pending" } };
  if (agent.status !== "approved") return { saved: false, errors: { form: "rejectedAgent" } };
  await writeSession({ role: "agent", sub: agent.id, exp: Date.now() + 1000 * 60 * 60 * 12 });
  redirect(`/${lang}/agent`);
}

export async function logout(formData: FormData) {
  const lang = formToRaw(formData).lang === "en" ? "en" : "ko";
  await clearSession();
  redirect(`/${lang}`);
}

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

function currency(value: string): Currency | null {
  if (value === "KRW" || value === "USD" || value === "EUR") return value;
  return null;
}

function statusOf(value: string): SaleStatus | null {
  if (value === "available" || value === "reserved" || value === "sold" || value === "hidden") return value;
  return null;
}

const CATEGORIES: PhotoCategory[] = ["exterior", "interior", "dashboard", "engine", "tires", "defect"];

export async function saveVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await adminOnly())) return { ...emptyForm, errors: { form: "auth" } };
  if (isLiveMode()) return { ...emptyForm, errors: { form: "live" } };
  const raw = formToRaw(formData);
  const lang = raw.lang === "en" ? "en" : "ko";
  const editing = clean(raw.originalId);
  const nextId = (clean(raw.id) || id("KB")).toUpperCase();
  if (!/^[A-Z0-9-]{4,24}$/.test(nextId)) return { saved: false, errors: { id: "invalid" } };
  const year = blankToNull(clean(raw.year));
  if (typeof year !== "number" || year < 1980 || year > 2035) return { saved: false, errors: { year: "invalid" } };
  const sale = statusOf(clean(raw.status));
  if (!sale) return { saved: false, errors: { status: "required" } };
  if (!clean(raw.manufacturerKo) && !clean(raw.manufacturerEn)) return { saved: false, errors: { manufacturerKo: "required" } };
  if (!clean(raw.modelKo) && !clean(raw.modelEn)) return { saved: false, errors: { modelKo: "required" } };

  const numeric = (key: string) => blankToNull(clean(raw[key]));
  const mileage = numeric("mileageKm");
  const seats = numeric("seats");
  const displacement = numeric("displacementCc");
  const lengthMm = numeric("lengthMm");
  const widthMm = numeric("widthMm");
  const heightMm = numeric("heightMm");
  const domesticAmount = numeric("domesticAmount");
  const exportAmount = numeric("exportAmount");
  const purchaseCost = numeric("purchaseCost");
  const actualSaleAmount = numeric("actualSaleAmount");
  const extraCosts = numeric("extraCosts");
  const agentFee = numeric("agentFee");
  const numberOrNull = (value: number | null | "invalid") => {
    if (value === "invalid") return "invalid" as const;
    return value;
  };
  if ([mileage, seats, displacement, lengthMm, widthMm, heightMm, domesticAmount, exportAmount, purchaseCost, actualSaleAmount, extraCosts, agentFee].some((value) => value === "invalid")) {
    return { saved: false, errors: { form: "invalid" } };
  }
  const mileageKm = numberOrNull(mileage) as number | null;
  const seatCount = numberOrNull(seats) as number | null;
  const displacementValue = numberOrNull(displacement) as number | null;
  const lengthValue = numberOrNull(lengthMm) as number | null;
  const widthValue = numberOrNull(widthMm) as number | null;
  const heightValue = numberOrNull(heightMm) as number | null;
  const domesticValue = numberOrNull(domesticAmount) as number | null;
  const exportValue = numberOrNull(exportAmount) as number | null;
  const purchaseValue = numberOrNull(purchaseCost) as number | null;
  const actualValue = numberOrNull(actualSaleAmount) as number | null;
  const extraValue = numberOrNull(extraCosts) as number | null;
  const feeValue = numberOrNull(agentFee) as number | null;
  const domesticCurrency = currency(clean(raw.domesticCurrency) || "KRW");
  const exportCurrency = currency(clean(raw.exportCurrency) || "USD");
  if (!domesticCurrency || !exportCurrency) return { saved: false, errors: { form: "currency" } };
  if (exportValue != null && !clean(raw.exportTerms)) return { saved: false, errors: { exportTerms: "required" } };

  const klass = clean(raw.class);
  if (klass !== "county" && klass !== "medium" && klass !== "large") {
    return { saved: false, errors: { class: "required" } };
  }
  const transmission = clean(raw.transmission);
  const fuel = clean(raw.fuel);
  const steering = clean(raw.steering);
  if (!["manual", "automatic", "unknown"].includes(transmission)) return { saved: false, errors: { transmission: "invalid" } };
  if (!["diesel", "gasoline", "lpg", "cng", "electric", "unknown"].includes(fuel)) return { saved: false, errors: { fuel: "invalid" } };
  if (!["lhd", "rhd", "unknown"].includes(steering)) return { saved: false, errors: { steering: "invalid" } };
  const longRaw = clean(raw.longBody);
  const longBody = longRaw === "yes" ? true : longRaw === "no" ? false : null;
  const text = (koKey: string, enKey: string) => {
    const ko = clean(raw[koKey]);
    const en = clean(raw[enKey]);
    return ko || en ? { ko, en } : null;
  };

  let error: FormState | null = null;
  const saved = await updateDb((db) => {
    if (db.vehicles.some((vehicle) => vehicle.id === nextId && vehicle.id !== editing)) {
      error = { saved: false, errors: { id: "invalid" } };
      return;
    }
    const previous = db.vehicles.find((vehicle) => vehicle.id === editing);
    const now = new Date().toISOString();
    const next: Vehicle = {
      id: nextId,
      manufacturerKey: clean(raw.manufacturerKey) || "custom",
      manufacturer: text("manufacturerKo", "manufacturerEn") || { ko: "", en: "" },
      modelKey: clean(raw.modelKey) || "custom",
      model: text("modelKo", "modelEn") || { ko: "", en: "" },
      trim: text("trimKo", "trimEn") || { ko: "", en: "" },
      class: klass,
      year,
      firstRegistered: clean(raw.firstRegistered) || null,
      mileageKm,
      seats: seatCount,
      transmission: transmission as Vehicle["transmission"],
      fuel: fuel as Vehicle["fuel"],
      engineModel: clean(raw.engineModel) || null,
      displacementCc: displacementValue,
      steering: steering as Vehicle["steering"],
      longBody,
      lengthMm: lengthValue,
      widthMm: widthValue,
      heightMm: heightValue,
      previousUse: text("previousUseKo", "previousUseEn"),
      location: text("locationKo", "locationEn"),
      maintenance: text("maintenanceKo", "maintenanceEn"),
      knownDefects: text("defectsKo", "defectsEn"),
      photographedAt: clean(raw.photographedAt) || null,
      stockCheckedAt: clean(raw.stockCheckedAt) || null,
      description: text("descriptionKo", "descriptionEn") || { ko: "", en: "" },
      status: sale,
      featured: raw.featured === "yes",
      createdAt: previous?.createdAt || now,
      updatedAt: now,
      domesticPrice:
        domesticValue == null ? null : { amount: domesticValue, currency: domesticCurrency },
      exportPrice:
        exportValue == null
          ? null
          : {
              amount: exportValue,
              currency: exportCurrency,
              terms: clean(raw.exportTerms),
              includes: text("exportIncludesKo", "exportIncludesEn") || { ko: "", en: "" },
            },
      photos: previous?.photos ?? [],
      videoUrl: clean(raw.videoUrl) || null,
      sample: true,
      internal: {
        purchaseCost: purchaseValue,
        actualSaleAmount: actualValue,
        extraCosts: extraValue,
        agentFee: feeValue,
      },
    };
    db.vehicles = db.vehicles.filter((vehicle) => vehicle.id !== editing && vehicle.id !== nextId);
    db.vehicles.unshift(next);
  });
  if (error) return error;
  if (!saved.ok) return { saved: false, errors: { form: "save" } };
  refresh();
  redirect(`/${lang}/admin/vehicles/${nextId}`);
}

export async function addPhotoSlot(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  const category = CATEGORIES.includes(raw.category as PhotoCategory) ? (raw.category as PhotoCategory) : "exterior";
  await updateDb((db) => {
    const vehicle = db.vehicles.find((item) => item.id === raw.id);
    if (!vehicle || vehicle.photos.length >= MAX_LISTING_PHOTOS) return;
    vehicle.photos.push({
      id: id("PH"),
      category,
      alt: { ko: raw.altKo || category, en: raw.altEn || category },
      file: null,
    });
    vehicle.updatedAt = new Date().toISOString();
  });
  refresh();
}

export async function uploadVehiclePhoto(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  if (!ALLOWED.has(file.type) || file.size > 5 * 1024 * 1024) return;
  const stored = `${randomBytes(8).toString("hex")}.${extOf(file.type)}`;
  const dir = path.join(process.cwd(), "public", "stock");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, stored), Buffer.from(await file.arrayBuffer()));
  const category = CATEGORIES.includes(raw.category as PhotoCategory) ? (raw.category as PhotoCategory) : "exterior";
  await updateDb((db) => {
    const vehicle = db.vehicles.find((item) => item.id === raw.id);
    if (!vehicle || vehicle.photos.length >= MAX_LISTING_PHOTOS) return;
    vehicle.photos.push({
      id: id("PH"),
      category,
      alt: { ko: raw.altKo || file.name, en: raw.altEn || file.name },
      file: stored,
    });
    vehicle.updatedAt = new Date().toISOString();
    if (!vehicle.photographedAt) vehicle.photographedAt = new Date().toISOString().slice(0, 10);
  });
  refresh();
}

export async function movePhoto(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  const direction = raw.direction === "up" ? -1 : 1;
  await updateDb((db) => {
    const vehicle = db.vehicles.find((item) => item.id === raw.id);
    if (!vehicle) return;
    const index = vehicle.photos.findIndex((photo) => photo.id === raw.photoId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= vehicle.photos.length) return;
    const [photo] = vehicle.photos.splice(index, 1);
    vehicle.photos.splice(target, 0, photo);
  });
  refresh();
}

export async function removePhoto(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  await updateDb((db) => {
    const vehicle = db.vehicles.find((item) => item.id === raw.id);
    if (!vehicle) return;
    vehicle.photos = vehicle.photos.filter((photo) => photo.id !== raw.photoId);
  });
  refresh();
}

export async function updateInquiry(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  const lang = raw.lang === "en" ? "en" : "ko";
  const statuses = ["new", "consulting", "quoted", "negotiating", "contract", "closed"];
  if (!statuses.includes(clean(raw.status))) return;
  if (raw.status === "closed" && !clean(raw.closeReason)) return;
  await updateDb((db) => {
    const inquiry = db.inquiries.find((item) => item.id === raw.id);
    if (!inquiry) return;
    const nextAgent = clean(raw.assignedAgentId) || null;
    const agentChanged = nextAgent !== (inquiry.assignedAgentId || null);
    if (agentChanged && !clean(raw.reason)) return;
    inquiry.status = raw.status as typeof inquiry.status;
    inquiry.staffNote = clean(raw.staffNote);
    inquiry.closeReason = clean(raw.closeReason);
    if (agentChanged) {
      const updated = assignAgent(inquiry, nextAgent, clean(raw.reason), new Date().toISOString());
      inquiry.assignedAgentId = updated.assignedAgentId;
      inquiry.referralHistory = updated.referralHistory;
    }
  });
  refresh();
  redirect(`/${lang}/admin/inquiries/${raw.id}`);
}

export async function createQuote(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  const lang = raw.lang === "en" ? "en" : "ko";
  const money = ["vehiclePrice", "domesticTransport", "exportCosts", "oceanFreight", "otherCosts"] as const;
  const values: Record<(typeof money)[number], number | null> = {
    vehiclePrice: null,
    domesticTransport: null,
    exportCosts: null,
    oceanFreight: null,
    otherCosts: null,
  };
  for (const key of money) {
    const parsed = blankToNull(clean(raw[key]));
    if (parsed === "invalid") return;
    values[key] = parsed;
  }
  const quoteCurrency = currency(clean(raw.currency) || "USD");
  if (!quoteCurrency) return;
  await updateDb((db) => {
    const inquiry = db.inquiries.find((item) => item.id === raw.inquiryId);
    if (!inquiry) return;
    const version = db.quotes.filter((quote) => quote.inquiryId === inquiry.id).reduce((max, quote) => Math.max(max, quote.version), 0) + 1;
    db.quotes.unshift({
      id: id("QT"),
      inquiryId: inquiry.id,
      vehicleId: inquiry.vehicleId,
      version,
      createdAt: new Date().toISOString(),
      validUntil: clean(raw.validUntil) || null,
      currency: quoteCurrency,
      ...values,
      included: clean(raw.included),
      excluded: clean(raw.excluded),
      terms: clean(raw.terms),
      demo: true,
    });
    if (inquiry.status === "new" || inquiry.status === "consulting") inquiry.status = "quoted";
  });
  refresh();
  redirect(`/${lang}/admin/inquiries/${raw.inquiryId}`);
}

export async function setAgentStatus(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  const status = raw.status === "approved" || raw.status === "rejected" ? raw.status : null;
  if (!status) return;
  await updateDb((db) => {
    const agent = db.agents.find((item) => item.id === raw.id);
    if (!agent) return;
    agent.status = status;
  });
  refresh();
}

export async function saveSettings(formData: FormData) {
  if (!(await adminOnly()) || isLiveMode()) return;
  const raw = formToRaw(formData);
  const lang = raw.lang === "en" ? "en" : "ko";
  await updateDb((db) => {
    db.settings = {
      companyNameKo: clean(raw.companyNameKo) || "K-BUS HUB",
      companyNameEn: clean(raw.companyNameEn) || "K-BUS HUB",
      representative: clean(raw.representative),
      businessNo: clean(raw.businessNo),
      phone: clean(raw.phone),
      kakaoUrl: clean(raw.kakaoUrl),
      whatsapp: clean(raw.whatsapp),
      email: clean(raw.email),
      addressKo: clean(raw.addressKo),
      addressEn: clean(raw.addressEn),
      hoursKo: clean(raw.hoursKo),
      hoursEn: clean(raw.hoursEn),
      privacyIntakeEnabled: raw.privacyIntakeEnabled === "yes",
    };
  });
  refresh();
  redirect(`/${lang}/admin/settings`);
}
