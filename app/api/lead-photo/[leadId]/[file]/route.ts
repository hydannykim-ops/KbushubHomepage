import { readFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string; file: string }> },
) {
  const session = await requireAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { leadId, file } = await params;
  if (!/^LD-[A-Z0-9]+$/.test(leadId) || !/^[a-f0-9]+\.(jpg|png|webp)$/.test(file)) {
    return new Response("Bad request", { status: 400 });
  }
  const full = path.join(process.cwd(), "data", "private-uploads", leadId, file);
  try {
    const data = await readFile(full);
    const type = file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new Response(data, {
      headers: { "Content-Type": type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
