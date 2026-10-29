export type DataSourceName = "demo" | "supabase" | "misconfigured";

export type SubmissionGate =
  | { ok: true; demo: boolean }
  | { ok: false; code: "privacy_disabled" | "not_configured" };

export function submissionGate(input: { dataSource: DataSourceName; privacyEnabled: boolean }): SubmissionGate {
  if (input.dataSource === "misconfigured") return { ok: false, code: "not_configured" };
  if (input.dataSource === "demo") return { ok: true, demo: true };
  if (!input.privacyEnabled) return { ok: false, code: "privacy_disabled" };
  return { ok: true, demo: false };
}

export async function acceptOrReject<T extends { id: string }>(
  gate: SubmissionGate,
  save: () => Promise<T>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!gate.ok) {
    return {
      status: gate.code === "privacy_disabled" ? 403 : 503,
      body: { ok: false, code: gate.code },
    };
  }
  try {
    const record = await save();
    return { status: 201, body: { ok: true, demo: gate.demo, id: record.id } };
  } catch {
    return { status: 500, body: { ok: false, code: "save_failed" } };
  }
}
