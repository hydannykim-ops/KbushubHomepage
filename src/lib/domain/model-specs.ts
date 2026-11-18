import type { Fuel, Transmission } from "./types";

/**
 * Representative catalog specs for the current Korean lineup.
 * Year and options change these numbers, so the admin form can still edit them.
 * Dimensions are intentionally omitted.
 */
export type ModelStandard = {
  seats: number | null;
  horsepowerPs: number | null;
  transmission: Transmission;
  fuel: Fuel;
  engineModel: string | null;
  displacementCc: number | null;
  steering: "lhd";
  longBody: boolean | null;
};

const dieselAuto = {
  transmission: "automatic" as const,
  fuel: "diesel" as const,
  steering: "lhd" as const,
};

/** Hyundai County current F engine: 170 PS, 3,933 cc. Seats follow the common 25 / long-body 29 layouts. */
const county: ModelStandard = {
  ...dieselAuto,
  seats: 25,
  horsepowerPs: 170,
  engineModel: "F",
  displacementCc: 3933,
  longBody: false,
};

const countyLong: ModelStandard = { ...county, seats: 29, longBody: true };

/** Solati A2.5 CRDi: 170 PS, 2,497 cc, 8-speed automatic, 15 seats. */
const solati: ModelStandard = {
  ...dieselAuto,
  seats: 15,
  horsepowerPs: 170,
  engineModel: "A2.5 CRDi",
  displacementCc: 2497,
  longBody: false,
};

/** Aero Town D6GA: 225 PS, 5,899 cc. Long body uses the higher seat layout. */
const aeroTown: ModelStandard = {
  ...dieselAuto,
  seats: 33,
  horsepowerPs: 225,
  transmission: "manual",
  engineModel: "D6GA",
  displacementCc: 5899,
  longBody: false,
};

/** Universe L engine: 440 PS, 12.7 L, 45+1 seats. EX trims are the longer bodies. */
const universe: ModelStandard = {
  ...dieselAuto,
  seats: 45,
  horsepowerPs: 440,
  engineModel: "L",
  displacementCc: 12700,
  longBody: false,
};

const universeLong: ModelStandard = { ...universe, longBody: true };

/** Kia New Granbird coach class shares the 440 PS / 12.7 L diesel layout. */
const granbird: ModelStandard = {
  ...dieselAuto,
  seats: 45,
  horsepowerPs: 440,
  engineModel: "Powertec",
  displacementCc: 12742,
  longBody: false,
};

const elecCity: ModelStandard = {
  seats: null,
  horsepowerPs: null,
  transmission: "automatic",
  fuel: "electric",
  engineModel: "Electric",
  displacementCc: null,
  steering: "lhd",
  longBody: false,
};

const specs: Record<string, ModelStandard> = {
  카운티: county,
  "카운티 롱바디": countyLong,
  쏠라티: solati,
  에어로타운: aeroTown,
  "에어로타운 롱바디": { ...aeroTown, seats: 37, longBody: true },
  유니버스: universe,
  "유니버스 노블": universe,
  "유니버스 프라임": universe,
  "유니버스 노블EX": universeLong,
  "유니버스 프라임EX": universeLong,
  "유니버스 럭셔리": universe,
  일렉시티: elecCity,
  그랜버드: granbird,
  "뉴그랜버드 실크로드": granbird,
  "뉴그랜버드 파크웨이": granbird,
  "뉴그랜버드 썬샤인": granbird,
};

export function standardForModel(model: string): ModelStandard | null {
  return specs[model] ?? null;
}
