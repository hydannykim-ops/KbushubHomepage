import "server-only";
import { getDataSource } from "./config";
import { getRepository, type AppRepository } from "./data/repository";
import { DataAccessError } from "./data/errors";
import type { SiteSettings } from "./domain/types";

export async function loadSite(): Promise<
  | { ok: true; source: "demo" | "supabase"; repo: AppRepository; settings: SiteSettings }
  | { ok: false; code: "misconfigured" | "upstream" }
> {
  const source = getDataSource();
  if (source === "misconfigured") return { ok: false, code: "misconfigured" };
  try {
    const repo = getRepository();
    const settings = await repo.getSettings();
    return { ok: true, source, repo, settings };
  } catch (error) {
    if (error instanceof DataAccessError) return { ok: false, code: error.code };
    throw error;
  }
}
