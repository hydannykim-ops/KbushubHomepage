import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { containsInternalKey, publicJson, visibleReferrals } from "../src/lib/domain/access";
import { readSession, signSession } from "../src/lib/domain/auth-token";
import { filterVehicles, parseVehicleQuery, serializeVehicleQuery } from "../src/lib/domain/filters";
import { internalProfit, summarizeQuote } from "../src/lib/domain/money";
import { normalizeReferralCode, referralForInquiry, rememberReferral, whatsappHref, whatsappMessage } from "../src/lib/domain/referral";
import { acceptOrReject, submissionGate } from "../src/lib/domain/submit";
import { checkImage } from "../src/lib/domain/uploads";
import { parseInquiry, parseQuote } from "../src/lib/domain/validation";
import {
  makerLabel,
  makersForClass,
  modelLabel,
  modelsForMaker,
  modelsForSeries,
  seriesForMaker,
  seriesHasVariants,
  seriesLabel,
  vehicleTitle,
} from "../src/lib/domain/vehicle-catalog";
import { buildSeed } from "../src/lib/demo/seed";
import { createDemoStore } from "../src/lib/demo/store";

test("price sort keeps currencies apart and puts ask-price last", () => {
  const seed = buildSeed();
  const domestic = filterVehicles(seed.vehicles, { sort: "price_asc" }, "domestic");
  assert.deepEqual(
    domestic.items.map((item) => item.stockNo),
    ["HB-L-01", "HB-C-01", "HB-L-02", "HB-C-02", "HB-L-TEST", "HB-M-01"],
  );
  assert.equal(domestic.items.some((item) => item.stockNo === "HB-M-02"), false);
  assert.equal(containsInternalKey(domestic.items), false);

  const exported = filterVehicles(seed.vehicles, { sort: "price_asc" }, "export");
  assert.equal(containsInternalKey(exported.items), false);
  const priced = exported.items.filter((item) => item.exportPriceAmount != null).map((item) => item.exportPriceCurrency);
  assert.deepEqual(priced, ["EUR", "USD", "USD"]);
  const usd = exported.items.filter((item) => item.exportPriceCurrency === "USD").map((item) => item.exportPriceAmount);
  assert.deepEqual(usd, [1000, 24000]);
  assert.equal(exported.items.at(-1)?.exportPriceAmount ?? null, null);
});

test("export price filter does not compare different currencies", () => {
  const seed = buildSeed();
  const ignored = filterVehicles(seed.vehicles, { priceMin: 1000, sort: "newest" }, "export");
  assert.equal(ignored.ignoredPriceFilter, true);
  assert.equal(ignored.items.length, 6);

  const usd = filterVehicles(seed.vehicles, { priceMin: 2000, priceCurrency: "USD", sort: "price_asc" }, "export");
  assert.equal(usd.ignoredPriceFilter, false);
  assert.deepEqual(
    usd.items.map((item) => item.stockNo),
    ["HB-C-01"],
  );
});

test("filters and shareable query round-trip", () => {
  const raw = "class=county&maker=현대&transmission=automatic&status=available&sort=year_desc&mode=export";
  const query = parseVehicleQuery(new URLSearchParams(raw));
  const seed = buildSeed();
  const result = filterVehicles(seed.vehicles, query, "export");
  assert.deepEqual(result.items.map((item) => item.stockNo).sort(), ["HB-C-01", "HB-C-02"]);
  const serialized = serializeVehicleQuery(query, { mode: "export", ref: "DEMOAGT1" });
  const again = parseVehicleQuery(new URLSearchParams(serialized));
  assert.equal(again.vehicleClass, "county");
  assert.equal(again.sort, "year_desc");
  assert.equal(new URLSearchParams(serialized).get("ref"), "DEMOAGT1");
});

test("transfer filter and export shipping preference", () => {
  const seed = buildSeed();
  const scrap = filterVehicles(seed.vehicles, { transferType: "scrap_replace" }, "domestic");
  assert.ok(scrap.items.every((item) => item.transferType === "scrap_replace"));
  assert.ok(scrap.items.some((item) => item.stockNo === "HB-M-01"));
  const county = seed.vehicles.find((item) => item.stockNo === "HB-C-01");
  assert.equal(county?.horsepowerPs, 150);
  assert.equal(county?.transferType, "transfer");

  const quoteOk = parseInquiry(
    {
      kind: "quote",
      tradeMode: "export",
      name: "Buyer",
      email: "buyer@example.com",
      country: "KH",
      message: "Need quote",
      destinationCountry: "KH",
      destinationPortUndecided: "true",
      shippingMethod: "roro",
      consent: "true",
    },
    "en",
  );
  assert.equal(quoteOk.ok, true);
  if (quoteOk.ok) assert.equal(quoteOk.data.shippingMethod, "roro");

  const quoteMissingShip = parseInquiry(
    {
      kind: "quote",
      tradeMode: "export",
      name: "Buyer",
      email: "buyer@example.com",
      country: "KH",
      message: "Need quote",
      destinationCountry: "KH",
      destinationPortUndecided: "true",
      consent: "true",
    },
    "en",
  );
  assert.equal(quoteMissingShip.ok, false);
});

test("domestic and export views share one sale status", () => {
  const seed = buildSeed();
  for (const mode of ["domestic", "export"] as const) {
    const rows = filterVehicles(seed.vehicles, {}, mode).items;
    assert.equal(rows.find((item) => item.stockNo === "HB-L-01")?.status, "sold");
    assert.equal(rows.find((item) => item.stockNo === "HB-M-01")?.status, "reserved");
  }
});

test("public payload excludes internal finance and hidden stock", () => {
  const hidden = buildSeed().vehicles.find((item) => item.stockNo === "HB-M-02");
  assert.ok(hidden);
  assert.equal(publicJson(hidden), null);
  const visible = buildSeed().vehicles.find((item) => item.stockNo === "HB-L-01");
  assert.ok(visible);
  const json = publicJson(visible);
  assert.ok(json);
  const parsed = JSON.parse(json) as unknown;
  assert.equal(containsInternalKey(parsed), false);
  assert.equal(JSON.stringify(parsed).includes("12345678"), false);
  assert.equal(JSON.stringify(parsed).includes("10000000"), false);
});

test("quote total stays unconfirmed when a line is unknown and keeps zero distinct", () => {
  const unknown = summarizeQuote({
    currency: "USD",
    lines: {
      vehiclePrice: { status: "amount", amount: 10000 },
      domesticTransport: { status: "zero", amount: 0 },
      exportCosts: { status: "unknown", amount: null },
      oceanFreight: { status: "amount", amount: 500 },
      otherCosts: { status: "unknown", amount: null },
    },
  });
  assert.equal(unknown.confirmed, false);
  assert.equal(unknown.total, null);
  assert.equal(unknown.knownSubtotal, 10500);
  assert.deepEqual(unknown.zeroKeys, ["domesticTransport"]);

  const confirmed = summarizeQuote({
    currency: "USD",
    lines: {
      vehiclePrice: { status: "amount", amount: 10000 },
      domesticTransport: { status: "zero", amount: 0 },
      exportCosts: { status: "amount", amount: 100 },
      oceanFreight: { status: "amount", amount: 500 },
      otherCosts: { status: "zero", amount: 0 },
    },
  });
  assert.equal(confirmed.confirmed, true);
  assert.equal(confirmed.total, 10600);
});

test("profit is unknown when currencies differ or amounts are missing", () => {
  const seed = buildSeed();
  const sold = seed.vehicles.find((item) => item.stockNo === "HB-L-01");
  const mixed = seed.vehicles.find((item) => item.stockNo === "HB-L-02");
  const open = seed.vehicles.find((item) => item.stockNo === "HB-C-01");
  assert.ok(sold && mixed && open);
  assert.deepEqual(internalProfit(sold.internal), { status: "amount", amount: 4500000, currency: "KRW" });
  assert.deepEqual(internalProfit(mixed.internal), { status: "unknown", reason: "currency" });
  assert.deepEqual(internalProfit(open.internal), { status: "unknown", reason: "missing" });
});

test("referral first touch is kept and whatsapp text includes stock and code", () => {
  const first = rememberReferral(null, "demoagt1");
  assert.deepEqual(first, { first: "DEMOAGT1", latest: "DEMOAGT1" });
  const next = rememberReferral(first.first, "OTHERAGT");
  assert.equal(next.first, "DEMOAGT1");
  assert.equal(next.latest, "OTHERAGT");
  assert.equal(normalizeReferralCode("bad"), null);
  const attached = referralForInquiry(next.first, next.latest);
  assert.equal(attached.firstReferralCode, "DEMOAGT1");
  assert.equal(attached.submitReferralCode, "OTHERAGT");
  const message = whatsappMessage({ lang: "en", stockNo: "HB-C-01", referralCode: attached.firstReferralCode });
  assert.match(message, /HB-C-01/);
  assert.match(message, /DEMOAGT1/);
  assert.equal(whatsappHref("", message), null);
  assert.match(whatsappHref("971500000000", message) ?? "", /DEMOAGT1/);
});

test("submission gate never treats a closed live channel as success", async () => {
  assert.deepEqual(submissionGate({ dataSource: "demo", privacyEnabled: false }), { ok: true, demo: true });
  assert.deepEqual(submissionGate({ dataSource: "supabase", privacyEnabled: false }), { ok: false, code: "privacy_disabled" });
  const failed = await acceptOrReject(submissionGate({ dataSource: "supabase", privacyEnabled: true }), async () => {
    throw new Error("db down");
  });
  assert.equal(failed.status, 500);
  assert.equal(failed.body.ok, false);
  let saved = false;
  const blocked = await acceptOrReject(submissionGate({ dataSource: "supabase", privacyEnabled: false }), async () => {
    saved = true;
    return { id: "x" };
  });
  assert.equal(saved, false);
  assert.equal(blocked.body.ok, false);
});

test("demo inquiry save, referral isolation, and quote snapshot", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "kbus-"));
  const store = createDemoStore(dir);
  const inquiry = await store.createInquiry(
    {
      kind: "quote",
      tradeMode: "export",
      name: "테스트",
      email: "buyer@example.com",
      phone: null,
      messenger: null,
      country: "AE",
      stockNo: "HB-C-01",
      message: "견적 요청",
      destinationCountry: "AE",
      destinationPort: null,
      destinationPortUndecided: true,
      shippingMethod: "undecided",
      consent: true,
      companyWebsite: "",
      lang: "ko",
    },
    { firstReferralCode: "DEMOAGT1", submitReferralCode: "OTHERAGT" },
  );
  assert.equal(inquiry.shippingMethod, "undecided");
  assert.equal(inquiry.demo, true);
  assert.equal(inquiry.firstReferralCode, "DEMOAGT1");
  assert.equal(inquiry.submitReferralCode, "OTHERAGT");
  assert.equal(inquiry.assignedAgentId, "agent-demo-1");

  const quote = await store.createQuote({
    inquiryId: inquiry.id,
    currency: "USD",
    lines: {
      vehiclePrice: { status: "amount", amount: 24000 },
      domesticTransport: { status: "unknown", amount: null },
      exportCosts: { status: "zero", amount: 0 },
      oceanFreight: { status: "unknown", amount: null },
      otherCosts: { status: "amount", amount: 100 },
    },
    includedItems: "vehicle",
    excludedItems: "duty",
    tradeTerms: "demo terms",
    validUntil: "2026-12-31",
  });
  const vehicle = await store.getAdminVehicle("veh-c-01");
  assert.ok(vehicle);
  vehicle.domesticPriceKrw = 1;
  await store.updateVehicle(vehicle.id, {
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
    domesticPriceKrw: 1,
    exportPriceAmount: 1,
    exportPriceCurrency: "USD",
    exportPriceTermsKo: vehicle.exportPriceTermsKo,
    exportPriceTermsEn: vehicle.exportPriceTermsEn,
    videoUrl: vehicle.videoUrl,
    internal: vehicle.internal,
  });
  const quotes = await store.listQuotes();
  assert.equal(quotes[0]?.lines.vehiclePrice.amount, 24000);
  assert.equal(quotes[0]?.id, quote.id);
  const summary = summarizeQuote(quotes[0]);
  assert.equal(summary.confirmed, false);

  const byEmail = await store.listInquiriesByEmail("buyer@example.com");
  assert.ok(byEmail.some((item) => item.id === inquiry.id));
  assert.ok(byEmail.some((item) => item.id === "inq-demo-1"));
  assert.equal(byEmail.some((item) => item.id === "inq-demo-2"), false);
  const demoReply = byEmail.find((item) => item.id === "inq-demo-1");
  assert.match(demoReply?.staffMemo ?? "", /주중 방문/);

  const own = await store.agentReferrals("DEMOAGT1");
  assert.equal(own.some((item) => item.id === "inq-demo-2"), false);
  assert.equal(JSON.stringify(own).includes("secret@example.com"), false);
  assert.equal(JSON.stringify(own).includes("buyer@example.com"), false);
  assert.equal(JSON.stringify(own).includes("주중 방문"), false);
  const pending = visibleReferrals((await store.listInquiries()), { status: "pending", referralCode: "DEMOPEND" });
  assert.deepEqual(pending, []);

  const reassigned = await store.updateInquiry(
    inquiry.id,
    { status: "negotiating", staffMemo: "내부", closeReason: null, assignedAgentId: null, assignmentReason: "기존 고객으로 확인" },
    "admin-test",
  );
  assert.equal(reassigned.assignedAgentId, null);
  assert.equal(reassigned.firstReferralCode, "DEMOAGT1");
  const history = await store.historyFor(inquiry.id);
  assert.equal(history.at(-1)?.reason, "기존 고객으로 확인");

  await assert.rejects(() => store.updateInquiry(inquiry.id, { status: "closed", staffMemo: null, closeReason: null, assignedAgentId: null, assignmentReason: null }, "admin"));
});

test("invalid inquiry and image checks", () => {
  const parsed = parseInquiry({ kind: "purchase", tradeMode: "domestic", name: "", message: "", country: "", consent: false }, "ko");
  assert.equal(parsed.ok, false);
  const quote = parseQuote({
    inquiryId: "inq",
    currency: "USD",
    lines: {
      vehiclePrice: { status: "amount", amount: 0 },
      domesticTransport: { status: "unknown", amount: null },
      exportCosts: { status: "zero", amount: 0 },
      oceanFreight: { status: "unknown", amount: null },
      otherCosts: { status: "unknown", amount: null },
    },
  });
  assert.equal(quote.ok, false);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  assert.equal(checkImage(png).ok, true);
  assert.equal(checkImage(Uint8Array.from([1, 2, 3, 4])).ok, false);
});

test("session token rejects tampering", () => {
  const token = signSession({ sub: "demo-admin", role: "admin", email: "admin@demo.kbus", exp: Date.now() + 1000 }, "secret");
  assert.equal(readSession(token, "secret")?.role, "admin");
  assert.equal(readSession(token, "other"), null);
  assert.equal(readSession(`${token}x`, "secret"), null);
});

test("dealer listings stay in review and customers cannot publish", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "kbus-member-"));
  const store = createDemoStore(dir);
  const dealer = await store.signupMember({
    role: "dealer",
    name: "김판매",
    email: "dealer@example.com",
    password: "password1",
    phone: null,
    company: "데모상사",
    consent: true,
    companyWebsite: "",
  });
  const customer = await store.signupMember({
    role: "customer",
    name: "이상담",
    email: "customer@example.com",
    password: "password1",
    phone: null,
    company: null,
    consent: true,
    companyWebsite: "",
  });
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  const input = {
    vehicleClass: "county" as const,
    maker: "현대",
    model: "카운티",
    modelYear: 2018,
    mileageKm: 1000,
    seats: 15,
    transmission: "automatic" as const,
    fuel: "diesel" as const,
    location: "데모",
    domesticPriceKrw: 1000000,
    descriptionKo: null,
    descriptionEn: null,
  };
  const shots = [
    { bytes: png, contentType: "image/png" as const, category: "front" as const, cover: true, label: "정면" },
    { bytes: png, contentType: "image/png" as const, category: "front_side" as const, cover: false, label: "좌측" },
    { bytes: png, contentType: "image/png" as const, category: "exterior" as const, cover: false, label: "우측" },
    { bytes: png, contentType: "image/png" as const, category: "rear" as const, cover: false, label: "후면" },
  ];
  await assert.rejects(
    () => store.createDealerListing(customer, input, shots),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "dealer_only",
  );
  const listing = await store.createDealerListing(dealer, input, shots);
  assert.equal(listing.status, "review");
  assert.equal(listing.listingSource, "dealer");
  assert.equal(JSON.stringify(listing).includes("password"), false);
  assert.equal(JSON.stringify(listing).includes("scrypt"), false);
  assert.equal("internal" in listing, false);
  const listed = await store.listPublic({}, "domestic");
  assert.equal(listed.items.some((item) => item.stockNo === listing.stockNo), false);
  assert.equal(publicJson({ ...listing, internal: { purchaseCost: 1, purchaseCurrency: "KRW", actualSaleAmount: null, saleCurrency: null, extraCosts: null, agentFee: null, feeCurrency: null, note: "비밀" }, ownerId: dealer.id, sellerName: dealer.name, sellerEmail: dealer.email, sellerCompany: dealer.company }), null);
  const owned = await store.listOwned(dealer.id);
  assert.equal(owned[0]?.stockNo, listing.stockNo);
  await store.createInquiry(
    {
      kind: "purchase",
      tradeMode: "domestic",
      name: "문의자",
      email: "buyer-on-listing@example.com",
      phone: "01011112222",
      messenger: null,
      country: "한국",
      stockNo: listing.stockNo,
      message: "딜러 매물 문의",
      destinationCountry: null,
      destinationPort: null,
      destinationPortUndecided: false,
      shippingMethod: null,
      consent: true,
      companyWebsite: "",
      lang: "ko",
    },
    { firstReferralCode: null, submitReferralCode: null },
  );
  const inbound = await store.listInquiriesByStockNos([listing.stockNo]);
  assert.equal(inbound.length, 1);
  assert.equal(inbound[0]?.message, "딜러 매물 문의");
  assert.deepEqual(await store.listInquiriesByStockNos([]), []);
  assert.equal(await store.verifyMember(dealer.email, "nope"), null);
  assert.equal((await store.verifyMember(dealer.email, "password1"))?.role, "dealer");
  await assert.rejects(
    () => store.signupMember({ ...dealer, password: "password1", consent: true, companyWebsite: "", phone: null }),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "duplicate_email",
  );
});

test("migration locks down internal tables and admin role grants", async () => {
  const sql = await readFile(path.join(process.cwd(), "supabase/migrations/0001_init.sql"), "utf8");
  assert.match(sql, /revoke all on table public\.vehicle_internal from anon, authenticated/i);
  assert.match(sql, /revoke all on table public\.inquiries from anon, authenticated/i);
  assert.match(sql, /enable row level security/i);
  assert.doesNotMatch(sql, /create policy[^;]+insert[^;]+user_roles/i);
  assert.match(sql, /agent_my_referrals/);
  assert.match(sql, /privacy_collection_enabled boolean not null default false/i);
  const members = await readFile(path.join(process.cwd(), "supabase/migrations/0002_members_and_review.sql"), "utf8");
  assert.match(members, /revoke all on table public\.member_profiles from anon, authenticated/i);
  assert.match(members, /status in \('available', 'reserved', 'sold'\)/i);
  assert.match(members, /owner_id/);
  assert.match(members, /review/);
  assert.doesNotMatch(members, /create policy[^;]+insert[^;]+user_roles/i);
  assert.doesNotMatch(members, /create policy[^;]+insert[^;]+member_profiles/i);
});

test("maker model catalog stays inside the selected vehicle class", () => {
  const mediumHyundai = modelsForMaker("현대", "medium");
  assert.ok(mediumHyundai.includes("에어로타운"));
  assert.equal(mediumHyundai.includes("유니버스"), false);
  assert.equal(mediumHyundai.includes("카운티"), false);

  const largeHyundai = modelsForMaker("현대", "large");
  assert.ok(largeHyundai.includes("유니버스"));
  assert.equal(largeHyundai.includes("에어로타운"), false);

  const mediumMakers = makersForClass("medium");
  assert.ok(mediumMakers.includes("현대"));
  assert.equal(mediumMakers.includes("기아"), false);

  const seed = buildSeed();
  const medium = filterVehicles(seed.vehicles, { vehicleClass: "medium", sort: "newest" }, "domestic");
  assert.ok(medium.items.every((item) => item.vehicleClass === "medium"));
  assert.ok(medium.items.some((item) => item.stockNo === "HB-M-01"));
  assert.equal(medium.items.some((item) => item.model === "유니버스"), false);
});

test("maker series drill-down groups shared model lines", () => {
  const hyundaiSeries = seriesForMaker("현대", "");
  assert.ok(hyundaiSeries.includes("에어로타운"));
  assert.ok(hyundaiSeries.includes("유니버스"));
  assert.equal(hyundaiSeries.includes("에어로타운 롱바디"), false);
  assert.equal(hyundaiSeries.includes("유니버스 노블"), false);

  assert.equal(seriesHasVariants("현대", "에어로타운", "medium"), true);
  assert.deepEqual([...modelsForSeries("현대", "에어로타운", "medium")], ["에어로타운", "에어로타운 롱바디"]);
  assert.equal(seriesHasVariants("현대", "쏠라티", "county"), false);
  assert.deepEqual([...modelsForSeries("현대", "유니버스", "large")], [
    "유니버스",
    "유니버스 노블",
    "유니버스 노블EX",
    "유니버스 프라임",
    "유니버스 프라임EX",
    "유니버스 럭셔리",
  ]);
});

test("catalog labels localize maker model series for non-Korean UI", () => {
  assert.equal(makerLabel("현대", "ko"), "현대");
  assert.equal(makerLabel("현대", "en"), "Hyundai");
  assert.equal(modelLabel("유니버스 프라임", "ko"), "유니버스 프라임");
  assert.equal(modelLabel("유니버스 프라임", "en"), "Universe Prime");
  assert.equal(seriesLabel("그랜버드", "en"), "Granbird");
  assert.equal(vehicleTitle({ maker: "현대", model: "카운티", trim: "데모" }, "en"), "Hyundai County 데모");
  assert.equal(vehicleTitle({ maker: "현대", model: "카운티", trim: "데모" }, "en", { includeTrim: false }), "Hyundai County");
  assert.equal(vehicleTitle({ maker: "현대", model: "카운티" }, "ko"), "현대 카운티");
});
