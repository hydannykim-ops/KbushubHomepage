import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { DataAccessError } from "@/lib/data/errors";
import { StoreError } from "@/lib/demo/store";
import { z } from "zod";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await requireMember();
  if (!session) return NextResponse.json({ ok: false, code: "login_required" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as unknown;
  const schema = z
    .object({
      name: z.string().trim().min(1).max(80),
      phone: z.string().trim().max(40).optional().or(z.literal("")),
      company: z.string().trim().max(80).optional().or(z.literal("")),
    })
    .superRefine((value, ctx) => {
      if (session.role === "dealer" && !(value.company ?? "").trim()) {
        ctx.addIssue({ code: "custom", path: ["company"], message: "company_required" });
      }
    });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, code: "invalid", errors: parsed.error.flatten().fieldErrors }, { status: 400 });

  try {
    const member = await getRepository().updateMember(session.sub, {
      name: parsed.data.name,
      phone: parsed.data.phone?.trim() || null,
      company: session.role === "dealer" ? parsed.data.company?.trim() || null : null,
    });
    return NextResponse.json({
      ok: true,
      member: { name: member.name, email: member.email, phone: member.phone, company: member.company, role: member.role },
    });
  } catch (error) {
    if (error instanceof StoreError) return NextResponse.json({ ok: false, code: error.code }, { status: 400 });
    if (error instanceof DataAccessError) return NextResponse.json({ ok: false, code: error.code }, { status: 503 });
    throw error;
  }
}
