import "server-only";
import { randomUUID } from "node:crypto";
import { toPublicVehicle } from "../domain/access";
import { filterVehicles, type FilterResult } from "../domain/filters";
import { quoteLineKeys } from "../domain/money";
import { generateReferralCode } from "../domain/referral";
import type {
  AdminVehicle,
  Agent,
  AgentReferral,
  AssignmentHistory,
  Inquiry,
  PhotoCategory,
  Quote,
  QuoteLine,
  SiteSettings,
  TradeMode,
  VehicleInternal,
  VehiclePhoto,
  VehicleQuery,
  VehicleRequest,
} from "../domain/types";
import { extensionFor, type ImageType } from "../domain/uploads";
import type { InquiryInput, InquiryUpdate, PartnerInput, QuoteInput, SellInput, SettingsInput, VehicleInput, WantedInput } from "../domain/validation";
import { createAnonClient, createServiceClient, createSupabaseServer } from "../supabase/clients";
import { DataAccessError } from "./errors";
import { StoreError } from "../demo/store";

const publicColumns =
  "id, stock_no, status, vehicle_class, maker, model, trim, model_year, first_registered_on, mileage_km, seats, transmission, fuel, engine_model, displacement_cc, steering, long_body, length_mm, width_mm, height_mm, previous_use_ko, previous_use_en, location, maintenance_ko, maintenance_en, defects_ko, defects_en, description_ko, description_en, photographed_on, stock_checked_on, featured, domestic_price_krw, export_price_amount, export_price_currency, export_price_terms_ko, export_price_terms_en, video_url, created_at, updated_at, vehicle_photos(id, vehicle_id, category, storage_path, content_type, sort_order, is_cover, alt_ko, alt_en)";

function fail(error: unknown, context: string): never {
  const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "unknown") : "unknown";
  console.error(JSON.stringify({ context, code }));
  throw new DataAccessError("upstream");
}

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function day(value: unknown): string | null {
  return typeof value === "string" && value ? value.slice(0, 10) : null;
}

function emptyInternal(): VehicleInternal {
  return {
    purchaseCost: null,
    purchaseCurrency: null,
    actualSaleAmount: null,
    saleCurrency: null,
    extraCosts: null,
    agentFee: null,
    feeCurrency: null,
    note: null,
  };
}

function mapPhoto(row: Record<string, unknown>): VehiclePhoto {
  return {
    id: String(row.id),
    vehicleId: String(row.vehicle_id),
    category: row.category as PhotoCategory,
    placeholder: false,
    storage: "supabase",
    path: text(row.storage_path),
    contentType: text(row.content_type),
    sortOrder: num(row.sort_order) ?? 0,
    isCover: Boolean(row.is_cover),
    altKo: typeof row.alt_ko === "string" ? row.alt_ko : "",
    altEn: typeof row.alt_en === "string" ? row.alt_en : "",
  };
}

function mapInternal(row: Record<string, unknown> | null): VehicleInternal {
  if (!row) return emptyInternal();
  return {
    purchaseCost: num(row.purchase_cost),
    purchaseCurrency: text(row.purchase_currency),
    actualSaleAmount: num(row.actual_sale_amount),
    saleCurrency: text(row.sale_currency),
    extraCosts: num(row.extra_costs),
    agentFee: num(row.agent_fee),
    feeCurrency: text(row.fee_currency),
    note: text(row.note),
  };
}

function mapVehicle(row: Record<string, unknown>, includeInternal: boolean): AdminVehicle {
  const photos = Array.isArray(row.vehicle_photos) ? row.vehicle_photos.map((photo) => mapPhoto(photo as Record<string, unknown>)) : [];
  photos.sort((a, b) => a.sortOrder - b.sortOrder);
  const internalRaw = row.vehicle_internal;
  const internalRow = Array.isArray(internalRaw) ? (internalRaw[0] as Record<string, unknown> | undefined) : (internalRaw as Record<string, unknown> | null);
  return {
    id: String(row.id),
    stockNo: String(row.stock_no),
    status: row.status as AdminVehicle["status"],
    vehicleClass: row.vehicle_class as AdminVehicle["vehicleClass"],
    maker: String(row.maker),
    model: String(row.model),
    trim: text(row.trim),
    modelYear: num(row.model_year),
    firstRegisteredOn: day(row.first_registered_on),
    mileageKm: num(row.mileage_km),
    seats: num(row.seats),
    transmission: row.transmission as AdminVehicle["transmission"],
    fuel: row.fuel as AdminVehicle["fuel"],
    engineModel: text(row.engine_model),
    displacementCc: num(row.displacement_cc),
    steering: row.steering as AdminVehicle["steering"],
    longBody: typeof row.long_body === "boolean" ? row.long_body : null,
    lengthMm: num(row.length_mm),
    widthMm: num(row.width_mm),
    heightMm: num(row.height_mm),
    previousUseKo: text(row.previous_use_ko),
    previousUseEn: text(row.previous_use_en),
    location: text(row.location),
    maintenanceKo: text(row.maintenance_ko),
    maintenanceEn: text(row.maintenance_en),
    defectsKo: text(row.defects_ko),
    defectsEn: text(row.defects_en),
    descriptionKo: text(row.description_ko),
    descriptionEn: text(row.description_en),
    photographedOn: day(row.photographed_on),
    stockCheckedOn: day(row.stock_checked_on),
    featured: Boolean(row.featured),
    domesticPriceKrw: num(row.domestic_price_krw),
    exportPriceAmount: num(row.export_price_amount),
    exportPriceCurrency: text(row.export_price_currency),
    exportPriceTermsKo: text(row.export_price_terms_ko),
    exportPriceTermsEn: text(row.export_price_terms_en),
    videoUrl: text(row.video_url),
    photos,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    demo: false,
    internal: includeInternal ? mapInternal(internalRow ?? null) : emptyInternal(),
  };
}

function vehicleRow(input: VehicleInput) {
  return {
    stock_no: input.stockNo,
    status: input.status,
    vehicle_class: input.vehicleClass,
    maker: input.maker,
    model: input.model,
    trim: input.trim,
    model_year: input.modelYear,
    first_registered_on: input.firstRegisteredOn,
    mileage_km: input.mileageKm,
    seats: input.seats,
    transmission: input.transmission,
    fuel: input.fuel,
    engine_model: input.engineModel,
    displacement_cc: input.displacementCc,
    steering: input.steering,
    long_body: input.longBody,
    length_mm: input.lengthMm,
    width_mm: input.widthMm,
    height_mm: input.heightMm,
    previous_use_ko: input.previousUseKo,
    previous_use_en: input.previousUseEn,
    location: input.location,
    maintenance_ko: input.maintenanceKo,
    maintenance_en: input.maintenanceEn,
    defects_ko: input.defectsKo,
    defects_en: input.defectsEn,
    description_ko: input.descriptionKo,
    description_en: input.descriptionEn,
    photographed_on: input.photographedOn,
    stock_checked_on: input.stockCheckedOn,
    featured: input.featured,
    domestic_price_krw: input.domesticPriceKrw,
    export_price_amount: input.exportPriceAmount,
    export_price_currency: input.exportPriceCurrency,
    export_price_terms_ko: input.exportPriceTermsKo,
    export_price_terms_en: input.exportPriceTermsEn,
    video_url: input.videoUrl,
    updated_at: new Date().toISOString(),
  };
}

function internalRow(vehicleId: string, input: VehicleInput["internal"]) {
  return {
    vehicle_id: vehicleId,
    purchase_cost: input.purchaseCost,
    purchase_currency: input.purchaseCurrency,
    actual_sale_amount: input.actualSaleAmount,
    sale_currency: input.saleCurrency,
    extra_costs: input.extraCosts,
    agent_fee: input.agentFee,
    fee_currency: input.feeCurrency,
    note: input.note,
    updated_at: new Date().toISOString(),
  };
}

function mapSettings(row: Record<string, unknown>): SiteSettings {
  return {
    companyName: String(row.company_name ?? "K-BUS HUB"),
    phone: text(row.phone),
    kakaoUrl: text(row.kakao_url),
    whatsappE164: text(row.whatsapp_e164),
    email: text(row.email),
    address: text(row.address),
    businessHours: text(row.business_hours),
    aboutKo: text(row.about_ko),
    aboutEn: text(row.about_en),
    privacyPolicyKo: text(row.privacy_policy_ko),
    privacyPolicyEn: text(row.privacy_policy_en),
    privacyCollectionEnabled: Boolean(row.privacy_collection_enabled),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function mapInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id: String(row.id),
    kind: row.kind as Inquiry["kind"],
    tradeMode: row.trade_mode as Inquiry["tradeMode"],
    name: String(row.name),
    email: text(row.email),
    phone: text(row.phone),
    messenger: text(row.messenger),
    country: String(row.country ?? ""),
    vehicleId: text(row.vehicle_id),
    stockNo: text(row.stock_no),
    message: String(row.message ?? ""),
    destinationCountry: text(row.destination_country),
    destinationPort: text(row.destination_port),
    destinationPortUndecided: Boolean(row.destination_port_undecided),
    firstReferralCode: text(row.first_referral_code),
    submitReferralCode: text(row.submit_referral_code),
    assignedAgentId: text(row.assigned_agent_id),
    status: row.status as Inquiry["status"],
    closeReason: text(row.close_reason),
    staffMemo: text(row.staff_memo),
    consentAt: text(row.consent_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    demo: false,
  };
}

function mapAgent(row: Record<string, unknown>): Agent {
  return {
    id: String(row.id),
    userId: text(row.user_id),
    status: row.status as Agent["status"],
    name: String(row.name),
    company: text(row.company),
    country: text(row.country),
    email: String(row.email),
    phone: text(row.phone),
    message: text(row.message),
    referralCode: String(row.referral_code),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    demo: false,
  };
}

function mapQuote(row: Record<string, unknown>): Quote {
  const raw = (row.lines ?? {}) as Record<string, QuoteLine>;
  const lines = {} as Quote["lines"];
  for (const key of quoteLineKeys) {
    const line = raw[key];
    lines[key] = line?.status ? { status: line.status, amount: line.status === "unknown" ? null : num(line.amount) } : { status: "unknown", amount: null };
  }
  return {
    id: String(row.id),
    inquiryId: String(row.inquiry_id),
    version: num(row.version) ?? 1,
    currency: String(row.currency),
    lines,
    includedItems: text(row.included_items),
    excludedItems: text(row.excluded_items),
    tradeTerms: text(row.trade_terms),
    validUntil: day(row.valid_until),
    vehicleStockNo: text(row.vehicle_stock_no),
    createdAt: String(row.created_at),
    demo: false,
  };
}

function mapRequest(row: Record<string, unknown>, files: VehicleRequest["files"]): VehicleRequest {
  return {
    id: String(row.id),
    type: row.type as VehicleRequest["type"],
    model: String(row.model),
    modelYear: num(row.model_year),
    mileageKm: num(row.mileage_km),
    seats: num(row.seats),
    quantity: num(row.quantity),
    budgetAmount: num(row.budget_amount),
    budgetCurrency: text(row.budget_currency),
    askingPriceAmount: num(row.asking_price_amount),
    askingPriceCurrency: text(row.asking_price_currency),
    location: text(row.location),
    destinationCountry: text(row.destination_country),
    desiredTime: text(row.desired_time),
    name: String(row.name),
    email: text(row.email),
    phone: text(row.phone),
    message: text(row.message),
    status: row.status as VehicleRequest["status"],
    staffMemo: text(row.staff_memo),
    firstReferralCode: text(row.first_referral_code),
    files,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    demo: false,
  };
}

async function loadAdmin(id: string): Promise<AdminVehicle | null> {
  const service = createServiceClient();
  const result = await service.from("vehicles").select(`${publicColumns}, vehicle_internal(*)`).eq("id", id).maybeSingle();
  if (result.error) fail(result.error, "admin_vehicle");
  return result.data ? mapVehicle(result.data as Record<string, unknown>, true) : null;
}

export function createSupabaseRepository() {
  return {
    async getSettings(): Promise<SiteSettings> {
      const anon = createAnonClient();
      const result = await anon.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (result.error) fail(result.error, "settings");
      if (!result.data) throw new DataAccessError("upstream");
      return mapSettings(result.data as Record<string, unknown>);
    },
    async updateSettings(input: SettingsInput): Promise<SiteSettings> {
      const service = createServiceClient();
      const result = await service
        .from("site_settings")
        .update({
          company_name: input.companyName,
          phone: input.phone,
          kakao_url: input.kakaoUrl,
          whatsapp_e164: input.whatsappE164,
          email: input.email,
          address: input.address,
          business_hours: input.businessHours,
          about_ko: input.aboutKo,
          about_en: input.aboutEn,
          privacy_policy_ko: input.privacyPolicyKo,
          privacy_policy_en: input.privacyPolicyEn,
          privacy_collection_enabled: input.privacyCollectionEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1)
        .select("*")
        .single();
      if (result.error) fail(result.error, "settings_update");
      return mapSettings(result.data as Record<string, unknown>);
    },
    async listPublic(query: VehicleQuery, mode: TradeMode): Promise<FilterResult> {
      const anon = createAnonClient();
      const result = await anon.from("vehicles").select(publicColumns).neq("status", "hidden");
      if (result.error) fail(result.error, "public_list");
      const vehicles = (result.data ?? []).map((row) => mapVehicle(row as Record<string, unknown>, false));
      return filterVehicles(vehicles, query, mode);
    },
    async getPublicByStockNo(stockNo: string) {
      const anon = createAnonClient();
      const result = await anon.from("vehicles").select(publicColumns).eq("stock_no", stockNo).maybeSingle();
      if (result.error) fail(result.error, "public_vehicle");
      if (!result.data) return null;
      return toPublicVehicle(mapVehicle(result.data as Record<string, unknown>, false));
    },
    async listAdminVehicles(): Promise<AdminVehicle[]> {
      const service = createServiceClient();
      const result = await service.from("vehicles").select(`${publicColumns}, vehicle_internal(*)`).order("created_at", { ascending: false });
      if (result.error) fail(result.error, "admin_list");
      return (result.data ?? []).map((row) => mapVehicle(row as Record<string, unknown>, true));
    },
    async getAdminVehicle(id: string) {
      return loadAdmin(id);
    },
    async createVehicle(input: VehicleInput): Promise<AdminVehicle> {
      const service = createServiceClient();
      const inserted = await service.from("vehicles").insert(vehicleRow(input)).select("id").single();
      if (inserted.error) {
        if (inserted.error.code === "23505") throw new StoreError("duplicate_stock");
        fail(inserted.error, "vehicle_insert");
      }
      const id = String(inserted.data.id);
      const internal = await service.from("vehicle_internal").insert(internalRow(id, input.internal));
      if (internal.error) fail(internal.error, "internal_insert");
      const vehicle = await loadAdmin(id);
      if (!vehicle) throw new DataAccessError("upstream");
      return vehicle;
    },
    async updateVehicle(id: string, input: VehicleInput): Promise<AdminVehicle> {
      const service = createServiceClient();
      const updated = await service.from("vehicles").update(vehicleRow(input)).eq("id", id).select("id");
      if (updated.error) {
        if (updated.error.code === "23505") throw new StoreError("duplicate_stock");
        fail(updated.error, "vehicle_update");
      }
      if (!updated.data?.length) throw new StoreError("not_found");
      const internal = await service.from("vehicle_internal").upsert(internalRow(id, input.internal));
      if (internal.error) fail(internal.error, "internal_upsert");
      const vehicle = await loadAdmin(id);
      if (!vehicle) throw new StoreError("not_found");
      return vehicle;
    },
    async addPhoto(vehicleId: string, file: { bytes: Buffer; contentType: ImageType; category: PhotoCategory; altKo: string; altEn: string }) {
      const service = createServiceClient();
      const existing = await service.from("vehicle_photos").select("id, is_cover").eq("vehicle_id", vehicleId);
      if (existing.error) fail(existing.error, "photo_list");
      if ((existing.data ?? []).length >= 12) throw new StoreError("too_many_photos");
      const id = randomUUID();
      const storagePath = `${vehicleId}/${id}.${extensionFor(file.contentType)}`;
      const uploaded = await service.storage.from("vehicle-photos").upload(storagePath, file.bytes, { contentType: file.contentType, upsert: false });
      if (uploaded.error) fail(uploaded.error, "photo_upload");
      const inserted = await service.from("vehicle_photos").insert({
        id,
        vehicle_id: vehicleId,
        category: file.category,
        storage_path: storagePath,
        content_type: file.contentType,
        sort_order: (existing.data ?? []).length,
        is_cover: (existing.data ?? []).every((item) => !item.is_cover),
        alt_ko: file.altKo,
        alt_en: file.altEn,
      }).select("*").single();
      if (inserted.error) fail(inserted.error, "photo_insert");
      return mapPhoto(inserted.data as Record<string, unknown>);
    },
    async updatePhoto(vehicleId: string, photoId: string, patch: Partial<Pick<VehiclePhoto, "category" | "sortOrder" | "isCover" | "altKo" | "altEn">>) {
      const service = createServiceClient();
      if (patch.isCover) {
        const cleared = await service.from("vehicle_photos").update({ is_cover: false }).eq("vehicle_id", vehicleId);
        if (cleared.error) fail(cleared.error, "photo_cover");
      }
      const payload: Record<string, unknown> = {};
      if (patch.category) payload.category = patch.category;
      if (patch.sortOrder != null) payload.sort_order = patch.sortOrder;
      if (patch.isCover != null) payload.is_cover = patch.isCover;
      if (patch.altKo != null) payload.alt_ko = patch.altKo;
      if (patch.altEn != null) payload.alt_en = patch.altEn;
      const updated = await service.from("vehicle_photos").update(payload).eq("id", photoId).eq("vehicle_id", vehicleId).select("*").single();
      if (updated.error) fail(updated.error, "photo_update");
      return mapPhoto(updated.data as Record<string, unknown>);
    },
    async deletePhoto(vehicleId: string, photoId: string) {
      const service = createServiceClient();
      const found = await service.from("vehicle_photos").select("storage_path").eq("id", photoId).eq("vehicle_id", vehicleId).maybeSingle();
      if (found.error) fail(found.error, "photo_delete_lookup");
      if (!found.data) throw new StoreError("not_found");
      if (found.data.storage_path) await service.storage.from("vehicle-photos").remove([found.data.storage_path]);
      const removed = await service.from("vehicle_photos").delete().eq("id", photoId);
      if (removed.error) fail(removed.error, "photo_delete");
    },
    async readPhoto(photoId: string, asAdmin: boolean) {
      const service = createServiceClient();
      const found = await service.from("vehicle_photos").select("storage_path, content_type, vehicle_id, vehicles(status)").eq("id", photoId).maybeSingle();
      if (found.error) fail(found.error, "photo_read");
      if (!found.data?.storage_path || !found.data.content_type) return null;
      const vehicle = found.data.vehicles as { status?: string } | { status?: string }[] | null;
      const status = Array.isArray(vehicle) ? vehicle[0]?.status : vehicle?.status;
      if (status === "hidden" && !asAdmin) return null;
      const downloaded = await service.storage.from("vehicle-photos").download(found.data.storage_path);
      if (downloaded.error || !downloaded.data) return null;
      return { bytes: Buffer.from(await downloaded.data.arrayBuffer()), contentType: found.data.content_type };
    },
    async createInquiry(input: InquiryInput, referral: { firstReferralCode: string | null; submitReferralCode: string | null }): Promise<Inquiry> {
      const service = createServiceClient();
      let vehicleId: string | null = null;
      let stockNo = input.stockNo;
      if (input.stockNo) {
        const vehicle = await service.from("vehicles").select("id, stock_no, status").eq("stock_no", input.stockNo).maybeSingle();
        if (vehicle.data && vehicle.data.status !== "hidden") {
          vehicleId = vehicle.data.id;
          stockNo = vehicle.data.stock_no;
        }
      }
      let assigned: string | null = null;
      if (referral.firstReferralCode) {
        const agent = await service.from("agent_profiles").select("id").eq("referral_code", referral.firstReferralCode).eq("status", "approved").maybeSingle();
        assigned = agent.data?.id ?? null;
      }
      const inserted = await service
        .from("inquiries")
        .insert({
          kind: input.kind,
          trade_mode: input.tradeMode,
          name: input.name,
          email: input.email,
          phone: input.phone,
          messenger: input.messenger,
          country: input.country,
          vehicle_id: vehicleId,
          stock_no: stockNo,
          message: input.message,
          destination_country: input.destinationCountry,
          destination_port: input.destinationPort,
          destination_port_undecided: input.destinationPortUndecided,
          first_referral_code: referral.firstReferralCode,
          submit_referral_code: referral.submitReferralCode,
          assigned_agent_id: assigned,
          consent_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (inserted.error) fail(inserted.error, "inquiry_insert");
      if (assigned) {
        await service.from("inquiry_agent_history").insert({
          inquiry_id: inserted.data.id,
          previous_agent_id: null,
          next_agent_id: assigned,
          reason: "최초 유입 코드와 일치하는 승인 에이전트",
          actor: "system",
        });
      }
      return mapInquiry(inserted.data as Record<string, unknown>);
    },
    async listInquiries() {
      const service = createServiceClient();
      const result = await service.from("inquiries").select("*").order("created_at", { ascending: false });
      if (result.error) fail(result.error, "inquiry_list");
      return (result.data ?? []).map((row) => mapInquiry(row as Record<string, unknown>));
    },
    async getInquiry(id: string) {
      const service = createServiceClient();
      const result = await service.from("inquiries").select("*").eq("id", id).maybeSingle();
      if (result.error) fail(result.error, "inquiry_get");
      return result.data ? mapInquiry(result.data as Record<string, unknown>) : null;
    },
    async historyFor(inquiryId: string): Promise<AssignmentHistory[]> {
      const service = createServiceClient();
      const result = await service.from("inquiry_agent_history").select("*").eq("inquiry_id", inquiryId).order("created_at");
      if (result.error) fail(result.error, "history");
      return (result.data ?? []).map((row) => ({
        id: String(row.id),
        inquiryId: String(row.inquiry_id),
        previousAgentId: text(row.previous_agent_id),
        nextAgentId: text(row.next_agent_id),
        reason: String(row.reason),
        actor: String(row.actor),
        createdAt: String(row.created_at),
      }));
    },
    async updateInquiry(id: string, patch: InquiryUpdate, actor: string) {
      const service = createServiceClient();
      const current = await service.from("inquiries").select("*").eq("id", id).maybeSingle();
      if (current.error) fail(current.error, "inquiry_update_lookup");
      if (!current.data) throw new StoreError("not_found");
      if (patch.status === "closed" && !patch.closeReason?.trim()) throw new StoreError("close_reason_required");
      const previous = text(current.data.assigned_agent_id);
      if (patch.assignedAgentId !== previous) {
        if (!patch.assignmentReason || patch.assignmentReason.trim().length < 2) throw new StoreError("reason_required");
        if (patch.assignedAgentId) {
          const agent = await service.from("agent_profiles").select("id").eq("id", patch.assignedAgentId).eq("status", "approved").maybeSingle();
          if (!agent.data) throw new StoreError("agent_not_approved");
        }
        const history = await service.from("inquiry_agent_history").insert({
          inquiry_id: id,
          previous_agent_id: previous,
          next_agent_id: patch.assignedAgentId,
          reason: patch.assignmentReason,
          actor,
        });
        if (history.error) fail(history.error, "history_insert");
      }
      const updated = await service
        .from("inquiries")
        .update({
          status: patch.status,
          staff_memo: patch.staffMemo,
          close_reason: patch.closeReason,
          assigned_agent_id: patch.assignedAgentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      if (updated.error) fail(updated.error, "inquiry_update");
      return mapInquiry(updated.data as Record<string, unknown>);
    },
    async listQuotes() {
      const service = createServiceClient();
      const result = await service.from("quotes").select("*").order("created_at", { ascending: false });
      if (result.error) fail(result.error, "quote_list");
      return (result.data ?? []).map((row) => mapQuote(row as Record<string, unknown>));
    },
    async createQuote(input: QuoteInput) {
      const service = createServiceClient();
      const inquiry = await service.from("inquiries").select("id, stock_no").eq("id", input.inquiryId).maybeSingle();
      if (inquiry.error) fail(inquiry.error, "quote_inquiry");
      if (!inquiry.data) throw new StoreError("not_found");
      const existing = await service.from("quotes").select("version").eq("inquiry_id", input.inquiryId);
      if (existing.error) fail(existing.error, "quote_version");
      const version = (existing.data ?? []).reduce((max, row) => Math.max(max, num(row.version) ?? 0), 0) + 1;
      const inserted = await service
        .from("quotes")
        .insert({
          inquiry_id: input.inquiryId,
          version,
          currency: input.currency,
          lines: input.lines,
          included_items: input.includedItems,
          excluded_items: input.excludedItems,
          trade_terms: input.tradeTerms,
          valid_until: input.validUntil,
          vehicle_stock_no: inquiry.data.stock_no,
        })
        .select("*")
        .single();
      if (inserted.error) fail(inserted.error, "quote_insert");
      return mapQuote(inserted.data as Record<string, unknown>);
    },
    async listAgents() {
      const service = createServiceClient();
      const result = await service.from("agent_profiles").select("*").order("created_at", { ascending: false });
      if (result.error) fail(result.error, "agent_list");
      return (result.data ?? []).map((row) => mapAgent(row as Record<string, unknown>));
    },
    async applyAgent(input: PartnerInput) {
      const service = createServiceClient();
      let code = generateReferralCode();
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const exists = await service.from("agent_profiles").select("id").eq("referral_code", code).maybeSingle();
        if (!exists.data) break;
        code = generateReferralCode();
      }
      const inserted = await service
        .from("agent_profiles")
        .insert({
          name: input.name,
          company: input.company,
          country: input.country,
          email: input.email,
          phone: input.phone,
          message: input.message,
          referral_code: code,
          status: "pending",
        })
        .select("*")
        .single();
      if (inserted.error) fail(inserted.error, "agent_apply");
      return mapAgent(inserted.data as Record<string, unknown>);
    },
    async updateAgent(id: string, patch: { status: Agent["status"]; userId: string | null }) {
      const service = createServiceClient();
      const updated = await service
        .from("agent_profiles")
        .update({ status: patch.status, user_id: patch.userId, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      if (updated.error) fail(updated.error, "agent_update");
      return mapAgent(updated.data as Record<string, unknown>);
    },
    async agentReferrals(referralCode: string): Promise<AgentReferral[]> {
      void referralCode;
      const supabase = await createSupabaseServer();
      const result = await supabase.rpc("agent_my_referrals");
      if (result.error) fail(result.error, "agent_referrals");
      return (result.data ?? []).map((row: { id: string; created_at: string; stock_no: string | null; trade_mode: AgentReferral["tradeMode"]; status: AgentReferral["status"] }) => ({
        id: String(row.id),
        createdAt: String(row.created_at),
        stockNo: text(row.stock_no),
        tradeMode: row.trade_mode,
        status: row.status,
      }));
    },
    async listRequests() {
      const service = createServiceClient();
      const result = await service.from("vehicle_requests").select("*, sell_request_files(*)").order("created_at", { ascending: false });
      if (result.error) fail(result.error, "request_list");
      return (result.data ?? []).map((row) => {
        const record = row as Record<string, unknown>;
        const files = Array.isArray(record.sell_request_files)
          ? record.sell_request_files.map((file) => {
              const item = file as Record<string, unknown>;
              return {
                id: String(item.id),
                requestId: String(item.request_id),
                path: String(item.storage_path),
                originalName: String(item.original_name),
                contentType: String(item.content_type),
                sizeBytes: num(item.size_bytes) ?? 0,
              };
            })
          : [];
        return mapRequest(record, files);
      });
    },
    async createWanted(input: WantedInput, referralCode: string | null) {
      const service = createServiceClient();
      const inserted = await service
        .from("vehicle_requests")
        .insert({
          type: "wanted",
          model: input.model,
          model_year: input.modelYear,
          seats: input.seats,
          quantity: input.quantity,
          budget_amount: input.budgetAmount,
          budget_currency: input.budgetCurrency,
          destination_country: input.destinationCountry,
          desired_time: input.desiredTime,
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          first_referral_code: referralCode,
        })
        .select("*")
        .single();
      if (inserted.error) fail(inserted.error, "wanted_insert");
      return mapRequest(inserted.data as Record<string, unknown>, []);
    },
    async createSell(input: SellInput, files: Array<{ bytes: Buffer; contentType: ImageType; originalName: string }>, referralCode: string | null) {
      const service = createServiceClient();
      const inserted = await service
        .from("vehicle_requests")
        .insert({
          type: "sell",
          model: input.model,
          model_year: input.modelYear,
          mileage_km: input.mileageKm,
          location: input.location,
          asking_price_amount: input.askingPriceAmount,
          asking_price_currency: input.askingPriceCurrency,
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          first_referral_code: referralCode,
        })
        .select("*")
        .single();
      if (inserted.error) fail(inserted.error, "sell_insert");
      const requestId = String(inserted.data.id);
      const stored = [];
      for (const file of files) {
        const fileId = randomUUID();
        const storagePath = `${requestId}/${fileId}.${extensionFor(file.contentType)}`;
        const uploaded = await service.storage.from("private-files").upload(storagePath, file.bytes, { contentType: file.contentType, upsert: false });
        if (uploaded.error) fail(uploaded.error, "sell_upload");
        const fileRow = await service
          .from("sell_request_files")
          .insert({
            id: fileId,
            request_id: requestId,
            storage_path: storagePath,
            original_name: file.originalName.slice(0, 160),
            content_type: file.contentType,
            size_bytes: file.bytes.byteLength,
          })
          .select("*")
          .single();
        if (fileRow.error) fail(fileRow.error, "sell_file_row");
        stored.push({
          id: fileId,
          requestId,
          path: storagePath,
          originalName: file.originalName,
          contentType: file.contentType,
          sizeBytes: file.bytes.byteLength,
        });
      }
      return mapRequest(inserted.data as Record<string, unknown>, stored);
    },
    async updateRequest(id: string, patch: { status: VehicleRequest["status"]; staffMemo: string | null }) {
      const service = createServiceClient();
      const updated = await service
        .from("vehicle_requests")
        .update({ status: patch.status, staff_memo: patch.staffMemo, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      if (updated.error) fail(updated.error, "request_update");
      return mapRequest(updated.data as Record<string, unknown>, []);
    },
    async readPrivateFile(fileId: string) {
      const service = createServiceClient();
      const found = await service.from("sell_request_files").select("storage_path, content_type").eq("id", fileId).maybeSingle();
      if (found.error) fail(found.error, "private_file");
      if (!found.data) return null;
      const downloaded = await service.storage.from("private-files").download(found.data.storage_path);
      if (downloaded.error || !downloaded.data) return null;
      return { bytes: Buffer.from(await downloaded.data.arrayBuffer()), contentType: found.data.content_type };
    },
  };
}
