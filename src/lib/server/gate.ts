import "server-only";
import { getDataSource } from "../config";
import { getRepository } from "../data/repository";
import { submissionGate, type SubmissionGate } from "../domain/submit";
import { DataAccessError } from "../data/errors";

export async function openGate(): Promise<SubmissionGate> {
  const source = getDataSource();
  if (source !== "supabase") return submissionGate({ dataSource: source, privacyEnabled: false });
  try {
    const settings = await getRepository().getSettings();
    return submissionGate({ dataSource: "supabase", privacyEnabled: settings.privacyCollectionEnabled });
  } catch (error) {
    if (error instanceof DataAccessError) return { ok: false, code: "not_configured" };
    throw error;
  }
}
