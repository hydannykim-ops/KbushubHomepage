import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/lib/actions";
import { DataProblem } from "@/components/data-problem";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { adminGate } from "@/lib/store";
import { btnSmall } from "@/lib/ui";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) redirect("/ko/admin/login");
  const gate = await adminGate();
  if (!gate.ok && gate.reason === "auth") redirect(`/${raw}/admin/login`);
  if (!gate.ok) return <DataProblem lang={raw} reason={gate.reason} />;
  const dict = getDict(raw);
  const trade = await tradeMode();
  const links = [
    ["", dict.admin.dashboard],
    ["vehicles", dict.admin.vehicles],
    ["inquiries", dict.admin.inquiries],
    ["quotes", dict.admin.quotes],
    ["agents", dict.admin.agents],
    ["leads", dict.admin.leads],
    ["settings", dict.admin.settings],
  ];
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">K-BUS HUB</h1>
        <form action={logout}>
          <input type="hidden" name="lang" value={raw} />
          <button className={btnSmall}>{dict.admin.logout}</button>
        </form>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto border-b border-line pb-3 text-sm">
        {links.map(([path, label]) => (
          <Link key={path} href={hrefFor(raw, `/admin${path ? `/${path}` : ""}`, trade)} className="shrink-0 px-2 py-1 font-medium">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
