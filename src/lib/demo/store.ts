import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { toOwnedListing, toPublicVehicle, visibleReferrals } from "../domain/access";
import { filterVehicles, type FilterResult } from "../domain/filters";
import { quoteLineKeys } from "../domain/money";
import { generateReferralCode } from "../domain/referral";
import type {
  AdminVehicle,
  Agent,
  AgentReferral,
  AssignmentHistory,
  Inquiry,
  InquiryStatus,
  Member,
  PhotoCategory,
  Quote,
  QuoteLine,
  SiteSettings,
  TradeMode,
  VehiclePhoto,
  VehicleQuery,
  VehicleRequest,
} from "../domain/types";
import type { DealerListingInput, InquiryInput, InquiryUpdate, PartnerInput, QuoteInput, SellInput, SettingsInput, SignupInput, VehicleInput, WantedInput } from "../domain/validation";
import { hashPassword, verifyPassword } from "../domain/password";
import { extensionFor, type ImageType } from "../domain/uploads";
import { buildSeed } from "./seed";
import type { DemoState } from "./state";

export class StoreError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso(): string {
  return new Date().toISOString();
}

function applyVehicleInput(current: AdminVehicle | null, input: VehicleInput, id: string): AdminVehicle {
  const createdAt = current?.createdAt ?? nowIso();
  return {
    id,
    stockNo: input.stockNo,
    status: input.status,
    vehicleClass: input.vehicleClass,
    maker: input.maker,
    model: input.model,
    trim: input.trim,
    modelYear: input.modelYear,
    firstRegisteredOn: input.firstRegisteredOn,
    mileageKm: input.mileageKm,
    seats: input.seats,
    transmission: input.transmission,
    fuel: input.fuel,
    engineModel: input.engineModel,
    displacementCc: input.displacementCc,
    steering: input.steering,
    longBody: input.longBody,
    lengthMm: input.lengthMm,
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    previousUseKo: input.previousUseKo,
    previousUseEn: input.previousUseEn,
    location: input.location,
    maintenanceKo: input.maintenanceKo,
    maintenanceEn: input.maintenanceEn,
    defectsKo: input.defectsKo,
    defectsEn: input.defectsEn,
    descriptionKo: input.descriptionKo,
    descriptionEn: input.descriptionEn,
    photographedOn: input.photographedOn,
    stockCheckedOn: input.stockCheckedOn,
    featured: input.featured,
    domesticPriceKrw: input.domesticPriceKrw,
    exportPriceAmount: input.exportPriceAmount,
    exportPriceCurrency: input.exportPriceCurrency,
    exportPriceTermsKo: input.exportPriceTermsKo,
    exportPriceTermsEn: input.exportPriceTermsEn,
    videoUrl: input.videoUrl,
    photos: current?.photos ?? [],
    createdAt,
    updatedAt: nowIso(),
    demo: true,
    internal: input.internal,
    ownerId: current?.ownerId ?? null,
    listingSource: current?.listingSource ?? "company",
    sellerName: current?.sellerName ?? null,
    sellerEmail: current?.sellerEmail ?? null,
    sellerCompany: current?.sellerCompany ?? null,
  };
}

export function createDemoStore(dir: string) {
  const file = path.join(dir, "demo-db.json");
  const uploadDir = path.join(dir, "uploads");
  let chain: Promise<unknown> = Promise.resolve();

  async function read(): Promise<DemoState> {
    try {
      const raw = await readFile(file, "utf8");
      const state = JSON.parse(raw) as DemoState;
      state.members ??= [];
      for (const member of state.members) {
        member.country ??= null;
      }
      for (const vehicle of state.vehicles ?? []) {
        vehicle.ownerId ??= null;
        vehicle.listingSource ??= "company";
        vehicle.sellerName ??= null;
        vehicle.sellerEmail ??= null;
        vehicle.sellerCompany ??= null;
      }
      return state;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT") {
        const seed = buildSeed();
        await mkdir(dir, { recursive: true });
        await writeFile(file, JSON.stringify(seed, null, 2));
        return seed;
      }
      throw error;
    }
  }

  async function write(state: DemoState): Promise<void> {
    await mkdir(dir, { recursive: true });
    await writeFile(file, JSON.stringify(state, null, 2));
  }

  function update<T>(mutator: (state: DemoState) => T | Promise<T>): Promise<T> {
    const run = chain.then(async () => {
      const state = await read();
      const result = await mutator(state);
      await write(state);
      return result;
    });
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  return {
    async getSettings(): Promise<SiteSettings> {
      return clone((await read()).settings);
    },
    async updateSettings(input: SettingsInput): Promise<SiteSettings> {
      return update((state) => {
        state.settings = { ...state.settings, ...input, updatedAt: nowIso() };
        return clone(state.settings);
      });
    },
    async listPublic(query: VehicleQuery, mode: TradeMode): Promise<FilterResult> {
      const state = await read();
      return filterVehicles(state.vehicles, query, mode);
    },
    async getPublicByStockNo(stockNo: string) {
      const state = await read();
      const found = state.vehicles.find((vehicle) => vehicle.stockNo.toLowerCase() === stockNo.toLowerCase());
      if (!found) return null;
      return toPublicVehicle(found);
    },
    async listAdminVehicles(): Promise<AdminVehicle[]> {
      return clone((await read()).vehicles);
    },
    async getAdminVehicle(id: string): Promise<AdminVehicle | null> {
      const found = (await read()).vehicles.find((vehicle) => vehicle.id === id || vehicle.stockNo === id);
      return found ? clone(found) : null;
    },
    async createVehicle(input: VehicleInput): Promise<AdminVehicle> {
      return update((state) => {
        if (state.vehicles.some((vehicle) => vehicle.stockNo === input.stockNo)) throw new StoreError("duplicate_stock");
        const vehicle = applyVehicleInput(null, input, randomUUID());
        state.vehicles.push(vehicle);
        return clone(vehicle);
      });
    },
    async updateVehicle(id: string, input: VehicleInput): Promise<AdminVehicle> {
      return update((state) => {
        const index = state.vehicles.findIndex((vehicle) => vehicle.id === id);
        if (index < 0) throw new StoreError("not_found");
        if (state.vehicles.some((vehicle) => vehicle.stockNo === input.stockNo && vehicle.id !== id)) {
          throw new StoreError("duplicate_stock");
        }
        const next = applyVehicleInput(state.vehicles[index], input, id);
        state.vehicles[index] = next;
        return clone(next);
      });
    },
    async addPhoto(
      vehicleId: string,
      file: { bytes: Buffer; contentType: ImageType; category: PhotoCategory; altKo: string; altEn: string },
    ): Promise<VehiclePhoto> {
      await mkdir(uploadDir, { recursive: true });
      return update((state) => {
        const vehicle = state.vehicles.find((item) => item.id === vehicleId);
        if (!vehicle) throw new StoreError("not_found");
        if (vehicle.photos.length >= 12) throw new StoreError("too_many_photos");
        const id = randomUUID();
        const filename = `${id}.${extensionFor(file.contentType)}`;
        const relative = path.join("uploads", filename);
        const photo: VehiclePhoto = {
          id,
          vehicleId,
          category: file.category,
          placeholder: false,
          storage: "file",
          path: relative,
          contentType: file.contentType,
          sortOrder: vehicle.photos.length,
          isCover: vehicle.photos.every((item) => !item.isCover),
          altKo: file.altKo,
          altEn: file.altEn,
        };
        return writeFile(path.join(dir, relative), file.bytes).then(() => {
          vehicle.photos.push(photo);
          vehicle.updatedAt = nowIso();
          return clone(photo);
        });
      });
    },
    async updatePhoto(vehicleId: string, photoId: string, patch: Partial<Pick<VehiclePhoto, "category" | "sortOrder" | "isCover" | "altKo" | "altEn">>) {
      return update((state) => {
        const vehicle = state.vehicles.find((item) => item.id === vehicleId);
        if (!vehicle) throw new StoreError("not_found");
        const photo = vehicle.photos.find((item) => item.id === photoId);
        if (!photo) throw new StoreError("not_found");
        if (patch.category) photo.category = patch.category;
        if (patch.sortOrder != null) photo.sortOrder = patch.sortOrder;
        if (patch.altKo != null) photo.altKo = patch.altKo;
        if (patch.altEn != null) photo.altEn = patch.altEn;
        if (patch.isCover) {
          for (const item of vehicle.photos) item.isCover = item.id === photoId;
        }
        vehicle.photos.sort((a, b) => a.sortOrder - b.sortOrder);
        return clone(photo);
      });
    },
    async deletePhoto(vehicleId: string, photoId: string) {
      return update((state) => {
        const vehicle = state.vehicles.find((item) => item.id === vehicleId);
        if (!vehicle) throw new StoreError("not_found");
        vehicle.photos = vehicle.photos.filter((item) => item.id !== photoId);
        if (vehicle.photos.length && !vehicle.photos.some((item) => item.isCover)) vehicle.photos[0].isCover = true;
      });
    },
    async readPhoto(photoId: string, viewer: { admin: boolean; ownerId: string | null }): Promise<{ bytes: Buffer; contentType: string } | null> {
      const state = await read();
      for (const vehicle of state.vehicles) {
        const photo = vehicle.photos.find((item) => item.id === photoId);
        if (!photo || photo.placeholder || !photo.path || !photo.contentType) continue;
        const restricted = vehicle.status === "hidden" || vehicle.status === "review";
        const owns = Boolean(viewer.ownerId) && vehicle.ownerId === viewer.ownerId;
        if (restricted && !viewer.admin && !owns) return null;
        const bytes = await readFile(path.join(dir, photo.path));
        return { bytes, contentType: photo.contentType };
      }
      return null;
    },
    async createInquiry(input: InquiryInput, referral: { firstReferralCode: string | null; submitReferralCode: string | null }): Promise<Inquiry> {
      return update((state) => {
        const vehicle = input.stockNo
          ? state.vehicles.find(
              (item) =>
                item.stockNo.toLowerCase() === input.stockNo!.toLowerCase() &&
                item.status !== "hidden" &&
                item.status !== "review",
            )
          : undefined;
        const agent = state.agents.find((item) => item.status === "approved" && item.referralCode === referral.firstReferralCode);
        const inquiry: Inquiry = {
          id: randomUUID(),
          kind: input.kind,
          tradeMode: input.tradeMode,
          name: input.name,
          email: input.email,
          phone: input.phone,
          messenger: input.messenger,
          country: input.country,
          vehicleId: vehicle?.id ?? null,
          stockNo: vehicle?.stockNo ?? input.stockNo,
          message: input.message,
          destinationCountry: input.destinationCountry,
          destinationPort: input.destinationPort,
          destinationPortUndecided: input.destinationPortUndecided,
          firstReferralCode: referral.firstReferralCode,
          submitReferralCode: referral.submitReferralCode,
          assignedAgentId: agent?.id ?? null,
          status: "new",
          closeReason: null,
          staffMemo: null,
          consentAt: nowIso(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
          demo: true,
        };
        state.inquiries.push(inquiry);
        if (agent) {
          state.history.push({
            id: randomUUID(),
            inquiryId: inquiry.id,
            previousAgentId: null,
            nextAgentId: agent.id,
            reason: "최초 유입 코드와 일치하는 승인 에이전트",
            actor: "system",
            createdAt: inquiry.createdAt,
          });
        }
        return clone(inquiry);
      });
    },
    async listInquiries(): Promise<Inquiry[]> {
      return clone((await read()).inquiries).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async getInquiry(id: string): Promise<Inquiry | null> {
      const found = (await read()).inquiries.find((item) => item.id === id);
      return found ? clone(found) : null;
    },
    async historyFor(inquiryId: string): Promise<AssignmentHistory[]> {
      return clone((await read()).history.filter((item) => item.inquiryId === inquiryId));
    },
    async updateInquiry(id: string, patch: InquiryUpdate, actor: string): Promise<Inquiry> {
      return update((state) => {
        const inquiry = state.inquiries.find((item) => item.id === id);
        if (!inquiry) throw new StoreError("not_found");
        if (patch.status === "closed" && !patch.closeReason?.trim()) throw new StoreError("close_reason_required");
        if (patch.assignedAgentId !== inquiry.assignedAgentId) {
          if (!patch.assignmentReason || patch.assignmentReason.trim().length < 2) throw new StoreError("reason_required");
          if (patch.assignedAgentId && !state.agents.some((agent) => agent.id === patch.assignedAgentId && agent.status === "approved")) {
            throw new StoreError("agent_not_approved");
          }
          state.history.push({
            id: randomUUID(),
            inquiryId: id,
            previousAgentId: inquiry.assignedAgentId,
            nextAgentId: patch.assignedAgentId,
            reason: patch.assignmentReason,
            actor,
            createdAt: nowIso(),
          });
          inquiry.assignedAgentId = patch.assignedAgentId;
        }
        inquiry.status = patch.status as InquiryStatus;
        inquiry.staffMemo = patch.staffMemo;
        inquiry.closeReason = patch.closeReason;
        inquiry.updatedAt = nowIso();
        return clone(inquiry);
      });
    },
    async listQuotes(): Promise<Quote[]> {
      return clone((await read()).quotes).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async createQuote(input: QuoteInput): Promise<Quote> {
      return update((state) => {
        const inquiry = state.inquiries.find((item) => item.id === input.inquiryId);
        if (!inquiry) throw new StoreError("not_found");
        const version = state.quotes.filter((quote) => quote.inquiryId === input.inquiryId).reduce((max, quote) => Math.max(max, quote.version), 0) + 1;
        const lines = {} as Quote["lines"];
        for (const key of quoteLineKeys) {
          const line = input.lines[key] as QuoteLine;
          lines[key] = { status: line.status, amount: line.status === "unknown" ? null : line.amount };
        }
        const quote: Quote = {
          id: randomUUID(),
          inquiryId: input.inquiryId,
          version,
          currency: input.currency,
          lines,
          includedItems: input.includedItems,
          excludedItems: input.excludedItems,
          tradeTerms: input.tradeTerms,
          validUntil: input.validUntil,
          vehicleStockNo: inquiry.stockNo,
          createdAt: nowIso(),
          demo: true,
        };
        state.quotes.push(quote);
        return clone(quote);
      });
    },
    async listAgents(): Promise<Agent[]> {
      return clone((await read()).agents);
    },
    async applyAgent(input: PartnerInput): Promise<Agent> {
      return update((state) => {
        let code = generateReferralCode();
        while (state.agents.some((agent) => agent.referralCode === code)) code = generateReferralCode();
        const agent: Agent = {
          id: randomUUID(),
          userId: null,
          status: "pending",
          name: input.name,
          company: input.company,
          country: input.country,
          email: input.email,
          phone: input.phone,
          message: input.message,
          referralCode: code,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          demo: true,
        };
        state.agents.push(agent);
        return clone(agent);
      });
    },
    async updateAgent(id: string, patch: { status: Agent["status"]; userId: string | null }): Promise<Agent> {
      return update((state) => {
        const agent = state.agents.find((item) => item.id === id);
        if (!agent) throw new StoreError("not_found");
        agent.status = patch.status;
        if (patch.userId !== undefined) agent.userId = patch.userId;
        agent.updatedAt = nowIso();
        return clone(agent);
      });
    },
    async agentReferrals(referralCode: string): Promise<AgentReferral[]> {
      const state = await read();
      const agent = state.agents.find((item) => item.referralCode === referralCode);
      if (!agent) return [];
      return visibleReferrals(state.inquiries, agent);
    },
    async listRequests(): Promise<VehicleRequest[]> {
      return clone((await read()).requests).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async createWanted(input: WantedInput, referralCode: string | null): Promise<VehicleRequest> {
      return update((state) => {
        const request: VehicleRequest = {
          id: randomUUID(),
          type: "wanted",
          model: input.model,
          modelYear: input.modelYear,
          mileageKm: null,
          seats: input.seats,
          quantity: input.quantity,
          budgetAmount: input.budgetAmount,
          budgetCurrency: input.budgetCurrency,
          askingPriceAmount: null,
          askingPriceCurrency: null,
          location: null,
          destinationCountry: input.destinationCountry,
          desiredTime: input.desiredTime,
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          status: "new",
          staffMemo: null,
          firstReferralCode: referralCode,
          files: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
          demo: true,
        };
        state.requests.push(request);
        return clone(request);
      });
    },
    async createSell(
      input: SellInput,
      files: Array<{ bytes: Buffer; contentType: ImageType; originalName: string }>,
      referralCode: string | null,
    ): Promise<VehicleRequest> {
      await mkdir(uploadDir, { recursive: true });
      return update(async (state) => {
        const id = randomUUID();
        const stored = [];
        for (const file of files) {
          const fileId = randomUUID();
          const filename = `${fileId}.${extensionFor(file.contentType)}`;
          const relative = path.join("uploads", filename);
          await writeFile(path.join(dir, relative), file.bytes);
          stored.push({
            id: fileId,
            requestId: id,
            path: relative,
            originalName: file.originalName,
            contentType: file.contentType,
            sizeBytes: file.bytes.byteLength,
          });
        }
        const request: VehicleRequest = {
          id,
          type: "sell",
          model: input.model,
          modelYear: input.modelYear,
          mileageKm: input.mileageKm,
          seats: null,
          quantity: null,
          budgetAmount: null,
          budgetCurrency: null,
          askingPriceAmount: input.askingPriceAmount,
          askingPriceCurrency: input.askingPriceCurrency,
          location: input.location,
          destinationCountry: null,
          desiredTime: null,
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          status: "new",
          staffMemo: null,
          firstReferralCode: referralCode,
          files: stored,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          demo: true,
        };
        state.requests.push(request);
        return clone(request);
      });
    },
    async updateRequest(id: string, patch: { status: VehicleRequest["status"]; staffMemo: string | null }): Promise<VehicleRequest> {
      return update((state) => {
        const request = state.requests.find((item) => item.id === id);
        if (!request) throw new StoreError("not_found");
        request.status = patch.status;
        request.staffMemo = patch.staffMemo;
        request.updatedAt = nowIso();
        return clone(request);
      });
    },
    async getMember(id: string): Promise<Member | null> {
      const member = (await read()).members.find((item) => item.id === id);
      if (!member) return null;
      return {
        id: member.id,
        role: member.role,
        name: member.name,
        email: member.email,
        phone: member.phone,
        company: member.company,
        country: member.country ?? null,
        createdAt: member.createdAt,
      };
    },
    async signupMember(input: SignupInput): Promise<Member> {
      return update((state) => {
        if (state.members.some((member) => member.email === input.email)) throw new StoreError("duplicate_email");
        const member = {
          id: randomUUID(),
          role: input.role,
          name: input.name,
          email: input.email,
          phone: input.phone,
          company: input.company,
          country: input.country,
          passwordHash: hashPassword(input.password),
          createdAt: nowIso(),
        };
        state.members.push(member);
        return {
          id: member.id,
          role: member.role,
          name: member.name,
          email: member.email,
          phone: member.phone,
          company: member.company,
          country: member.country,
          createdAt: member.createdAt,
        };
      });
    },
    async verifyMember(email: string, password: string): Promise<Member | null> {
      const member = (await read()).members.find((item) => item.email === email.trim().toLowerCase());
      if (!member || !verifyPassword(password, member.passwordHash)) return null;
      return {
        id: member.id,
        role: member.role,
        name: member.name,
        email: member.email,
        phone: member.phone,
        company: member.company,
        country: member.country ?? null,
        createdAt: member.createdAt,
      };
    },
    async listOwned(ownerId: string) {
      return (await read()).vehicles.filter((vehicle) => vehicle.ownerId === ownerId).map((vehicle) => toOwnedListing(clone(vehicle)));
    },
    async createDealerListing(
      owner: Member,
      input: DealerListingInput,
      files: { front: Buffer; frontSide: Buffer; rear: Buffer; extras: Array<{ bytes: Buffer; contentType: ImageType }> },
      types: { front: ImageType; frontSide: ImageType; rear: ImageType },
    ) {
      if (owner.role !== "dealer") throw new StoreError("dealer_only");
      await mkdir(uploadDir, { recursive: true });
      return update(async (state) => {
        let stockNo = "";
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const candidate = `DLR-${randomBytes(3).toString("hex").toUpperCase()}`;
          if (!state.vehicles.some((vehicle) => vehicle.stockNo === candidate)) {
            stockNo = candidate;
            break;
          }
        }
        if (!stockNo) stockNo = `DLR-${randomUUID().slice(0, 8).toUpperCase()}`;
        const id = randomUUID();
        const createdAt = nowIso();
        const photos: VehiclePhoto[] = [];
        const writePhoto = async (bytes: Buffer, contentType: ImageType, category: PhotoCategory, cover: boolean, label: string) => {
          const photoId = randomUUID();
          const relative = path.join("uploads", `${photoId}.${extensionFor(contentType)}`);
          await writeFile(path.join(dir, relative), bytes);
          photos.push({
            id: photoId,
            vehicleId: id,
            category,
            placeholder: false,
            storage: "file",
            path: relative,
            contentType,
            sortOrder: photos.length,
            isCover: cover,
            altKo: label,
            altEn: label,
          });
        };
        await writePhoto(files.front, types.front, "front", true, "정면");
        await writePhoto(files.frontSide, types.frontSide, "front_side", false, "정측면");
        await writePhoto(files.rear, types.rear, "rear", false, "후면");
        for (const extra of files.extras) {
          await writePhoto(extra.bytes, extra.contentType, "exterior", false, "추가 사진");
        }
        const vehicle: AdminVehicle = {
          id,
          stockNo,
          status: "review",
          vehicleClass: input.vehicleClass,
          maker: input.maker,
          model: input.model,
          trim: null,
          modelYear: input.modelYear,
          firstRegisteredOn: null,
          mileageKm: input.mileageKm,
          seats: input.seats,
          transmission: input.transmission,
          fuel: input.fuel,
          engineModel: null,
          displacementCc: null,
          steering: "unknown",
          longBody: null,
          lengthMm: null,
          widthMm: null,
          heightMm: null,
          previousUseKo: null,
          previousUseEn: null,
          location: input.location,
          maintenanceKo: null,
          maintenanceEn: null,
          defectsKo: null,
          defectsEn: null,
          descriptionKo: input.descriptionKo,
          descriptionEn: input.descriptionEn,
          photographedOn: null,
          stockCheckedOn: null,
          featured: false,
          domesticPriceKrw: input.domesticPriceKrw,
          exportPriceAmount: null,
          exportPriceCurrency: null,
          exportPriceTermsKo: null,
          exportPriceTermsEn: null,
          videoUrl: null,
          photos,
          createdAt,
          updatedAt: createdAt,
          demo: true,
          internal: {
            purchaseCost: null,
            purchaseCurrency: null,
            actualSaleAmount: null,
            saleCurrency: null,
            extraCosts: null,
            agentFee: null,
            feeCurrency: null,
            note: null,
          },
          ownerId: owner.id,
          listingSource: "dealer",
          sellerName: owner.name,
          sellerEmail: owner.email,
          sellerCompany: owner.company,
        };
        state.vehicles.push(vehicle);
        return toOwnedListing(clone(vehicle));
      });
    },
    async readPrivateFile(fileId: string): Promise<{ bytes: Buffer; contentType: string } | null> {
      const state = await read();
      for (const request of state.requests) {
        const file = request.files.find((item) => item.id === fileId);
        if (!file) continue;
        const bytes = await readFile(path.join(dir, file.path));
        return { bytes, contentType: file.contentType };
      }
      return null;
    },
  };
}

export type DemoStore = ReturnType<typeof createDemoStore>;

let singleton: DemoStore | null = null;

export function getDemoStore(): DemoStore {
  if (!singleton) {
    const dir = process.env.DEMO_DATA_DIR?.trim() || path.join(process.cwd(), ".data");
    singleton = createDemoStore(dir);
  }
  return singleton;
}
