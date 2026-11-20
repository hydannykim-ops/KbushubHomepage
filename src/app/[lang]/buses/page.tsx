import { redirect } from "next/navigation";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";

export default async function BusesPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = parseLang((await params).lang);
  if (!lang) redirect("/ko/vehicles");
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) if (typeof value === "string") sp.set(key, value);
  const ctx = await requestContext(lang, sp);
  redirect(hrefTo(lang, "/vehicles", ctx));
}
