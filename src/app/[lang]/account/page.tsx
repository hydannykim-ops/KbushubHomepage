import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/member-forms";
import { DataProblem } from "@/components/catalog";
import { getSession } from "@/lib/auth/session";
import { copy } from "@/lib/i18n";
import { inquiryStatusLabel, statusLabel } from "@/lib/labels";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";
import type { Inquiry, Lang, OwnedListing, PublicVehicle, TradeMode } from "@/lib/domain/types";

type AccountTab = "inquiries" | "inbound" | "profile" | "listings" | "sell";
type AccountCtx = { mode: TradeMode; ref: string | null };

function parseTab(raw: string | undefined, role: "customer" | "dealer"): AccountTab {
  if (raw === "profile" || raw === "inquiries") return raw;
  if (role === "dealer" && (raw === "inbound" || raw === "listings")) return raw;
  if (role === "customer" && raw === "sell") return "sell";
  return "inquiries";
}

function tabHref(lang: Lang, ctx: AccountCtx, tab: AccountTab) {
  return hrefTo(lang, "/account", ctx, { tab });
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
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);
  const session = await getSession();
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
  const member = await site.repo.getMember(session.sub);
  const listings = session.role === "dealer" ? await site.repo.listOwned(session.sub) : [];
  const profile = {
    name: member?.name || session.name || "",
    email: member?.email || session.email,
    phone: member?.phone ?? null,
    company: member?.company ?? null,
    country: member?.country ?? null,
  };
  const inquiries = await site.repo.listInquiriesByEmail(profile.email);
  const inquiryCards = await Promise.all(
    inquiries.slice(0, 12).map(async (inquiry) => {
      const vehicle = inquiry.stockNo ? await site.repo.getPublicByStockNo(inquiry.stockNo) : null;
      return { inquiry, vehicle };
    }),
  );
  const listingInquiries =
    session.role === "dealer" && listings.length
      ? await site.repo.listInquiriesByStockNos(listings.map((listing) => listing.stockNo))
      : [];
  const inboundCards = await Promise.all(
    listingInquiries
      .filter((inquiry) => (inquiry.email ?? "").toLowerCase() !== profile.email.toLowerCase())
      .slice(0, 12)
      .map(async (inquiry) => {
        const vehicle = inquiry.stockNo ? await site.repo.getPublicByStockNo(inquiry.stockNo) : null;
        const owned = listings.find((listing) => listing.stockNo === inquiry.stockNo) ?? null;
        return { inquiry, vehicle: vehicle ?? owned };
      }),
  );

  const menu: { id: AccountTab; label: string; count?: number }[] = [
    { id: "inquiries", label: text.myInquiriesTitle, count: inquiryCards.length },
    ...(session.role === "dealer"
      ? [{ id: "inbound" as const, label: text.listingInquiriesTitle, count: inboundCards.length }]
      : []),
    { id: "profile", label: text.profileTitle },
    ...(session.role === "dealer"
      ? [{ id: "listings" as const, label: text.myListings, count: listings.length }]
      : [{ id: "sell" as const, label: text.navSell }]),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{text.accountTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {profile.name ? `${profile.name} · ` : ""}
          {profile.email} · {session.role === "dealer" ? text.roleDealer : text.roleCustomer}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-7">
        <aside className="border border-line bg-white">
          <p className="border-b border-line px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase">{text.mypageMenu}</p>
          <nav className="flex gap-1 overflow-x-auto p-2 lg:block lg:space-y-1 lg:overflow-visible" aria-label={text.mypageMenu}>
            {menu.map((item) => {
              const active = tab === item.id;
              return (
                <Link
                  key={item.id}
                  href={tabHref(lang, ctx, item.id)}
                  className={`flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 text-sm whitespace-nowrap lg:w-full ${
                    active ? "bg-[#eef3fb] font-semibold text-primary" : "text-ink hover:bg-[#f6f7f9]"
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof item.count === "number" ? <span className="text-xs text-muted tabular-nums">{item.count}</span> : null}
                </Link>
              );
            })}
          </nav>
          <form action="/api/auth/logout" method="post" className="border-t border-line px-2 py-2">
            <button className="w-full px-3 py-2.5 text-left text-sm font-semibold text-muted hover:bg-[#f6f7f9]">{text.logout}</button>
          </form>
        </aside>

        <div className="min-w-0 border border-line bg-white p-5 sm:p-6">
          {tab === "inquiries" ? (
            <InquiriesPanel
              lang={lang}
              ctx={ctx}
              title={text.myInquiriesTitle}
              body={text.myInquiriesBody}
              empty={text.myInquiriesEmpty}
              cards={inquiryCards}
              text={text}
            />
          ) : null}

          {tab === "inbound" ? (
            <InboundPanel
              lang={lang}
              title={text.listingInquiriesTitle}
              body={text.listingInquiriesBody}
              empty={text.listingInquiriesEmpty}
              cards={inboundCards}
              text={text}
            />
          ) : null}

          {tab === "profile" ? (
            <section>
              <h2 className="text-xl font-semibold">{text.profileTitle}</h2>
              <p className="mt-2 text-sm text-muted">{text.profileBody}</p>
              <div className="mt-5 max-w-lg">
                <ProfileForm lang={lang} role={session.role} initial={profile} />
              </div>
            </section>
          ) : null}

          {tab === "listings" ? (
            <section>
              <h2 className="text-xl font-semibold">{text.myListings}</h2>
              <p className="mt-2 text-sm text-muted">{text.reviewNote}</p>
              {listings.length ? (
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {listings.map((listing) => (
                    <li key={listing.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                      <Link href={hrefTo(lang, `/vehicles/${listing.stockNo}`, ctx)} className="font-medium text-ink hover:text-primary">
                        {listing.stockNo} · {vehicleTitle(listing, lang)}
                      </Link>
                      <span className="font-semibold">{statusLabel(listing.status, lang)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">{text.noListings}</p>
              )}
              <Link href={hrefTo(lang, "/sell", ctx)} className="mt-5 inline-flex bg-primary px-4 py-3 text-sm font-semibold text-white">
                {text.navSell}
              </Link>
            </section>
          ) : null}

          {tab === "sell" ? (
            <section>
              <h2 className="text-xl font-semibold">{text.navSell}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{text.consultBody}</p>
              <Link href={hrefTo(lang, "/sell", ctx, { consult: "1" })} className="mt-5 inline-flex bg-primary px-4 py-3 text-sm font-semibold text-white">
                {text.navSell}
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InquiriesPanel({
  lang,
  ctx,
  title,
  body,
  empty,
  cards,
  text,
}: {
  lang: Lang;
  ctx: AccountCtx;
  title: string;
  body: string;
  empty: string;
  cards: { inquiry: Inquiry; vehicle: PublicVehicle | null }[];
  text: ReturnType<typeof copy>;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
      {cards.length ? (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {cards.map(({ inquiry, vehicle }) => (
            <li key={inquiry.id} className="grid gap-2 py-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {inquiry.stockNo ?? text.inquiryGeneral}
                    {vehicle ? ` · ${vehicleTitle(vehicle, lang)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {inquiry.createdAt.slice(0, 10)} · {inquiry.tradeMode === "export" ? text.modeExport : text.modeDomestic}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{inquiryStatusLabel(inquiry.status, lang)}</span>
                  {inquiry.stockNo ? (
                    <Link href={hrefTo(lang, `/vehicles/${inquiry.stockNo}`, ctx)} className="text-primary underline">
                      {text.view}
                    </Link>
                  ) : null}
                </div>
              </div>
              {inquiry.message ? (
                <div>
                  <p className="text-xs font-semibold text-muted">{text.inquiryMessageLabel}</p>
                  <p className="mt-1 whitespace-pre-wrap text-ink">{inquiry.message}</p>
                </div>
              ) : null}
              <div className="border border-line bg-[#f8f8f6] px-3 py-3">
                <p className="text-xs font-semibold text-muted">{text.inquiryReplyLabel}</p>
                {inquiry.staffMemo?.trim() ? (
                  <p className="mt-1 whitespace-pre-wrap text-ink">{inquiry.staffMemo}</p>
                ) : (
                  <p className="mt-1 text-muted">{text.inquiryReplyPending}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      )}
    </section>
  );
}

function InboundPanel({
  lang,
  title,
  body,
  empty,
  cards,
  text,
}: {
  lang: Lang;
  title: string;
  body: string;
  empty: string;
  cards: { inquiry: Inquiry; vehicle: PublicVehicle | OwnedListing | null }[];
  text: ReturnType<typeof copy>;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
      {cards.length ? (
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {cards.map(({ inquiry, vehicle }) => (
            <li key={inquiry.id} className="grid gap-2 py-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {inquiry.stockNo}
                    {vehicle ? ` · ${vehicleTitle(vehicle, lang)}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {inquiry.createdAt.slice(0, 10)} · {inquiry.tradeMode === "export" ? text.modeExport : text.modeDomestic}
                  </p>
                </div>
                <span className="font-semibold">{inquiryStatusLabel(inquiry.status, lang)}</span>
              </div>
              <p className="text-ink">
                {inquiry.name}
                {inquiry.phone ? ` · ${inquiry.phone}` : ""}
              </p>
              {inquiry.message ? <p className="whitespace-pre-wrap text-muted">{inquiry.message}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      )}
    </section>
  );
}
