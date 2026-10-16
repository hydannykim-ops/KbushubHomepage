import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Footer, Header } from "@/components/chrome";
import { DemoBanner } from "@/components/catalog";
import { SiteChat } from "@/components/site-chat";
import { getSession } from "@/lib/auth/session";
import { getDataSource } from "@/lib/config";
import { copy } from "@/lib/i18n";
import { parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = parseLang(raw) ?? "ko";
  const demo = getDataSource() !== "supabase";
  return {
    description: copy(lang).metaDescription,
    robots: demo ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = parseLang(raw);
  if (!lang) notFound();
  // Mode/ref come from proxy headers + cookies (layouts do not receive searchParams).
  const ctx = await requestContext(lang, new URLSearchParams());
  const session = await getSession();
  const site = await loadSite();
  const settings = site.ok
    ? {
        name: site.settings.companyName,
        phone: site.settings.phone,
        email: site.settings.email,
        address: site.settings.address,
      }
    : { name: "K-BUS HUB", phone: null, email: null, address: null };
  return (
    <>
      {getDataSource() === "demo" ? <DemoBanner lang={lang} /> : null}
      <Header lang={lang} defaultMode={ctx.mode} refCode={ctx.ref} member={session ? { role: session.role, name: session.name } : null} />
      <main id="content">{children}</main>
      <Footer lang={lang} mode={ctx.mode} refCode={ctx.ref} company={settings} />
      <Suspense fallback={null}>
        <SiteChat lang={lang} mode={ctx.mode} refCode={ctx.ref} />
      </Suspense>
    </>
  );
}
