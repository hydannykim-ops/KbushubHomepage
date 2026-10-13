import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { hashPassword, requireAdmin, requireAgent } from "./auth";
import { isLiveMode } from "./demo-accounts";
import { toPublic } from "./domain";
import { createSeed } from "./seed";
import type { DB } from "./types";

export type Load =
  | { ok: true; db: DB }
  | { ok: false; reason: "live_not_connected" | "read_failed" };

const file = () => process.env.DATA_FILE || path.join(process.cwd(), "data", "runtime.json");

let chain: Promise<void> = Promise.resolve();

async function loadFile(): Promise<Load> {
  if (isLiveMode()) return { ok: false, reason: "live_not_connected" };
  const target = file();
  try {
    const raw = await fs.readFile(target, "utf8");
    const parsed = JSON.parse(raw) as DB;
    if (parsed?.version !== 1 || !Array.isArray(parsed.vehicles) || !Array.isArray(parsed.inquiries)) {
      return { ok: false, reason: "read_failed" };
    }
    return { ok: true, db: parsed };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") return { ok: false, reason: "read_failed" };
    const db = createSeed(hashPassword);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(db, null, 2));
    return { ok: true, db };
  }
}

export async function readDb(): Promise<Load> {
  const run = chain.then(loadFile);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function updateDb(mutator: (db: DB) => void): Promise<Load> {
  const run = chain.then(async (): Promise<Load> => {
    const loaded = await loadFile();
    if (!loaded.ok) return loaded;
    mutator(loaded.db);
    const target = file();
    const tmp = `${target}.tmp`;
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(tmp, JSON.stringify(loaded.db, null, 2));
    await fs.rename(tmp, target);
    return loaded;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  try {
    return await run;
  } catch {
    return { ok: false, reason: "read_failed" };
  }
}

export async function publicData() {
  const loaded = await readDb();
  if (!loaded.ok) return loaded;
  return {
    ok: true as const,
    vehicles: loaded.db.vehicles.map(toPublic),
    settings: loaded.db.settings,
  };
}

export async function adminGate() {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, reason: "auth" as const };
  const loaded = await readDb();
  if (!loaded.ok) return loaded;
  return { ok: true as const, db: loaded.db, session };
}

export async function agentGate() {
  const session = await requireAgent();
  if (!session) return { ok: false as const, reason: "auth" as const };
  const loaded = await readDb();
  if (!loaded.ok) return loaded;
  const agent = loaded.db.agents.find((item) => item.id === session.sub && item.status === "approved");
  if (!agent) return { ok: false as const, reason: "auth" as const };
  return { ok: true as const, db: loaded.db, agent };
}
