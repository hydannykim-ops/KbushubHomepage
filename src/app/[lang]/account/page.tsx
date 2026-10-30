import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountShell, type AccountTab } from "@/components/account-shell";
import { DataProblem } from "@/components/catalog";
import { getSession } from "@/lib/auth/session";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

function parseTab(raw: string | undefined, role: "customer" | "dealer"): AccountTab {
  if (raw === "profile" || raw === "inquiries") return raw;
  if (role === "dealer" && (raw === "inbound" || raw === "listings")) return raw;
  if (role === "customer" && raw === "sell") return "sell";
  return "inquiries";
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = parseLang((await params).lang);
  if (!lang) notFound();
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) if (typeof value === "string") sp.set(key, value);
  const ctx = await requestContext(lang, sp);
  const [site, session] = await Promise.all([loadSite(), getSession()]);
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);
  if (!session || (session.role !== "customer" && session.role !== "dealer")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-3xl font-semibold">{text.accountTitle}</h1>
        <p className="mt-3 text-sm text-muted">{text.guestSellBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={hrefTo(lang, "/account/login", ctx)} className="bg-primary px-4 py-3 text-sm font-semibold text-white">
            {text.navLogin}
          </Link>
          <Link href={hrefTo(lang, "/account/signup", ctx)} className="border border-line bg-white px-4 py-3 text-sm font-semibold">
            {text.navSignup}
          </Link>
        </div>
      </div>
    );
  }

  const tab = parseTab(typeof raw.tab === "string" ? raw.tab : undefined, session.role);
  const [member, listings] = await Promise.all([
    site.repo.getMember(session.sub),
    session.role === "dealer" ? site.repo.listOwned(session.sub) : Promise.resolve([]),
  ]);

  const profile = {
    name: member?.name || session.name || "",
    email: member?.email || session.email,
    phone: member?.phone ?? null,
    company: member?.company ?? null,
    country: member?.country ?? null,
  };

  const [myInquiries, listingInquiries] = await Promise.all([
    site.repo.listInquiriesByEmail(profile.email),
    session.role === "dealer" && listings.length
      ? site.repo.listInquiriesByStockNos(listings.map((listing) => listing.stockNo))
      : Promise.resolve([]),
  ]);

  const stockNos = [
    ...myInquiries.slice(0, 12).map((inquiry) => inquiry.stockNo),
    ...listingInquiries.slice(0, 12).map((inquiry) => inquiry.stockNo),
  ].filter((value): value is string => Boolean(value));

  const vehiclesByStock = await site.repo.getPublicByStockNos(stockNos);

  const inquiryCards = myInquiries.slice(0, 12).map((inquiry) => ({
    inquiry,
    vehicle: inquiry.stockNo ? vehiclesByStock.get(inquiry.stockNo) ?? null : null,
  }));

  const inboundCards = listingInquiries
    .filter((inquiry) => (inquiry.email ?? "").toLowerCase() !== profile.email.toLowerCase())
    .slice(0, 12)
    .map((inquiry) => {
      const owned = listings.find((listing) => listing.stockNo === inquiry.stockNo) ?? null;
      return {
        inquiry,
        vehicle: (inquiry.stockNo ? vehiclesByStock.get(inquiry.stockNo) : null) ?? owned,
      };
    });

  return (
    <AccountShell
      lang={lang}
      ctx={{ mode: ctx.mode, ref: ctx.ref }}
      text={text}
      role={session.role}
      initialTab={tab}
      profile={profile}
      inquiryCards={inquiryCards}
      inboundCards={inboundCards}
      listings={listings}
    />
  );
}
