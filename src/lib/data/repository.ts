import "server-only";
import { getDataSource } from "../config";
import { getDemoStore, type DemoStore } from "../demo/store";
import { DataAccessError } from "./errors";
import { createSupabaseRepository } from "./supabase-repository";

export type AppRepository = DemoStore;

export function getRepository(): AppRepository {
  const source = getDataSource();
  if (source === "misconfigured") throw new DataAccessError("misconfigured");
  if (source === "demo") return getDemoStore();
  return createSupabaseRepository() as AppRepository;
}
