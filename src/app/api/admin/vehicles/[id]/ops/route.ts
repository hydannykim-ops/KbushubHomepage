import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { StoreError } from "@/lib/demo/store";
import type { SaleStatus } from "@/lib/domain/types";
import { absoluteUrl } from "@/lib/http/request-url";

export const runtime = "nodejs";

const statuses = new Set<SaleStatus>(["available", "reserved", "sold", "hidden", "review"]);

function backTo(request: Request, form: FormData, fallback: string) {
  const raw = String(form.get("returnTo") ?? "");
  if (raw.startsWith("/admin") && !raw.startsWith("//")) return absoluteUrl(request, raw);
  return absoluteUrl(request, fallback);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const fallback = "/admin/vehicles";
  if (!admin) return NextResponse.redirect(absoluteUrl(request, "/admin/login"), 303);
  const form = await request.formData();
  const back = backTo(request, form, fallback);
  const intent = String(form.get("intent") ?? "");
  try {
    if (intent === "delete") {
      await getRepository().deleteVehicle(id);
      const list = absoluteUrl(request, "/admin/vehicles");
      list.searchParams.set("saved", "deleted");
      return NextResponse.redirect(list, 303);
    }
    if (intent === "status") {
      const status = String(form.get("status") ?? "");
      if (!statuses.has(status as SaleStatus)) {
        back.searchParams.set("error", "invalid");
        return NextResponse.redirect(back, 303);
      }
      await getRepository().setVehicleStatus(id, status as SaleStatus);
      back.searchParams.set("saved", "1");
      back.searchParams.delete("error");
      return NextResponse.redirect(back, 303);
    }
    back.searchParams.set("error", "invalid");
    return NextResponse.redirect(back, 303);
  } catch (error) {
    const code = error instanceof StoreError ? error.code : error instanceof DataAccessError ? error.code : "save_failed";
    back.searchParams.set("error", code);
    return NextResponse.redirect(back, 303);
  }
}
