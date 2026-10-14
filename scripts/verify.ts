import assert from "node:assert/strict";
import { assignAgent, compareByPrice, filterVehicles, quoteTotal, toAgentInquiryView, toPublic } from "../lib/domain";
import { createSeed } from "../lib/seed";
import { parseInquiry } from "../lib/validators";
import type { Inquiry, PublicVehicle, Quote } from "../lib/types";

const db = createSeed(() => "hash");
const publicVehicles = db.vehicles.map(toPublic);
const hidden = db.vehicles.find((vehicle) => vehicle.id === "KB-H9901");
assert.ok(hidden?.internal);
const exposed = toPublic(hidden);
assert.equal("internal" in exposed, false);
assert.equal(JSON.stringify(exposed).includes("purchaseCost"), false);

const domestic = filterVehicles(publicVehicles, "domestic", { sort: "priceAsc", page: 1 });
assert.equal(domestic.items.some((vehicle) => vehicle.id === "KB-H9901"), false);
const priced = domestic.items.filter((vehicle) => vehicle.domesticPrice);
const unpriced = domestic.items.filter((vehicle) => !vehicle.domesticPrice);
assert.ok(priced.length > 0 && unpriced.length > 0);
const lastPriced = domestic.items.findIndex((vehicle) => !vehicle.domesticPrice);
assert.ok(domestic.items.slice(lastPriced).every((vehicle) => !vehicle.domesticPrice));
const amounts = priced.map((vehicle) => vehicle.domesticPrice!.amount);
assert.deepEqual(amounts, [...amounts].sort((a, b) => a - b));

const exportAsc = filterVehicles(publicVehicles, "export", { sort: "priceAsc" }).items.filter(
  (vehicle) => vehicle.exportPrice,
);
const currencies = exportAsc.map((vehicle) => vehicle.exportPrice!.currency);
assert.deepEqual(currencies, [...currencies].sort((a, b) => a.localeCompare(b)));
const usd = exportAsc.filter((vehicle) => vehicle.exportPrice!.currency === "USD");
const usdAmounts = usd.map((vehicle) => vehicle.exportPrice!.amount);
assert.deepEqual(usdAmounts, [...usdAmounts].sort((a, b) => a - b));
assert.equal(compareByPrice(usd[0], exportAsc.find((v) => v.exportPrice!.currency === "EUR") as PublicVehicle, "export", "asc") > 0, true);

const filtered = filterVehicles(publicVehicles, "export", {
  priceMin: 40000,
  currency: "USD",
  sort: "priceAsc",
});
assert.ok(filtered.items.every((vehicle) => vehicle.exportPrice?.currency === "USD" && vehicle.exportPrice.amount >= 40000));
assert.equal(filtered.items.some((vehicle) => vehicle.id === "KB-L2007"), false);

const ignored = filterVehicles(publicVehicles, "export", { priceMin: 1, sort: "newest" });
assert.equal(ignored.priceIgnored, true);
assert.ok(ignored.total > filtered.total);

const sold = publicVehicles.find((vehicle) => vehicle.status === "sold");
assert.equal(filterVehicles([sold!], "domestic", {}).items[0]?.status, "sold");
assert.equal(filterVehicles([sold!], "export", {}).items[0]?.status, "sold");

const incomplete = quoteTotal({
  vehiclePrice: 100,
  domesticTransport: null,
  exportCosts: 0,
  oceanFreight: 0,
  otherCosts: 0,
});
assert.equal(incomplete.state, "incomplete");
const complete = quoteTotal({
  vehiclePrice: 100,
  domesticTransport: 0,
  exportCosts: 0,
  oceanFreight: 20,
  otherCosts: 5,
});
assert.deepEqual(complete, { state: "complete", total: 125 });

const quotes: Quote[] = [
  {
    id: "QT-1",
    inquiryId: "INQ-1",
    vehicleId: "KB-C1903",
    version: 1,
    createdAt: "2026-10-01T00:00:00.000Z",
    validUntil: null,
    currency: "USD",
    vehiclePrice: 18500,
    domesticTransport: 0,
    exportCosts: 0,
    oceanFreight: null,
    otherCosts: null,
    included: "vehicle",
    excluded: "freight",
    terms: "FOB Busan",
    demo: true,
  },
];
const before = JSON.stringify(quotes);
db.vehicles = db.vehicles.map((vehicle) =>
  vehicle.id === "KB-C1903" ? { ...vehicle, domesticPrice: { amount: 1, currency: "KRW" } } : vehicle,
);
assert.equal(JSON.stringify(quotes), before);

const inquiry: Inquiry = {
  id: "INQ-1",
  createdAt: "2026-10-12T00:00:00.000Z",
  name: "Secret Name",
  contact: "secret@example.com",
  trade: "export",
  country: "AE",
  vehicleId: "KB-L2109",
  message: "private message",
  kind: "quote",
  destinationCountry: "AE",
  destinationPort: null,
  portUndecided: true,
  status: "new",
  staffNote: "internal",
  closeReason: "",
  referralCode: "DEMOAGT1",
  assignedAgentId: null,
  referralHistory: [],
  consentAt: "2026-10-12T00:00:00.000Z",
  policyVersion: "draft-0",
  demo: true,
};
const assigned = assignAgent(inquiry, "agt_other", "중복 확인 후 변경", "2026-10-13T00:00:00.000Z");
assert.equal(assigned.referralCode, "DEMOAGT1");
assert.equal(assigned.assignedAgentId, "agt_other");
assert.equal(assigned.referralHistory.length, 1);
const view = toAgentInquiryView(inquiry);
assert.equal("name" in view, false);
assert.equal("contact" in view, false);
assert.equal(JSON.stringify(view).includes("secret"), false);

const bad = parseInquiry({
  name: "A",
  contact: "a",
  trade: "export",
  kind: "quote",
  message: "Need a quote",
  consent: "yes",
  destinationCountry: "",
  portUndecided: "",
  destinationPort: "",
});
assert.equal(bad.ok, false);

const good = parseInquiry({
  name: "Mina",
  contact: "mina@example.com",
  trade: "export",
  kind: "quote",
  message: "Please quote this bus.",
  consent: "yes",
  country: "KR",
  destinationCountry: "Ghana",
  portUndecided: "yes",
  vehicleId: "KB-L2109",
});
assert.equal(good.ok, true);
if (good.ok) assert.equal(good.value.destinationPort, null);

console.log("verify ok");
