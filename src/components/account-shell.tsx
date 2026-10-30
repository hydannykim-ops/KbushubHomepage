"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { ProfileForm } from "@/components/member-forms";
import { inquiryStatusLabel, statusLabel } from "@/lib/labels";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import type { Inquiry, Lang, OwnedListing, PublicVehicle, TradeMode } from "@/lib/domain/types";
import type { Messages } from "@/lib/i18n/messages";

export type AccountTab = "inquiries" | "inbound" | "profile" | "listings" | "sell";

type AccountCtx = { mode: TradeMode; ref: string | null };

type Card = { inquiry: Inquiry; vehicle: PublicVehicle | OwnedListing | null };

function hrefTo(lang: Lang, path: string, ctx: AccountCtx, extra?: Record<string, string>) {
  const query = new URLSearchParams();
  if (ctx.ref) query.set("ref", ctx.ref);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (key === "mode") continue;
      if (value) query.set(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `/${lang}${path}?${qs}` : `/${lang}${path}`;
}

export function AccountShell({
  lang,
  ctx,
  text,
  role,
  initialTab,
  profile,
  inquiryCards,
  inboundCards,
  listings,
}: {
  lang: Lang;
  ctx: AccountCtx;
  text: Messages;
  role: "customer" | "dealer";
  initialTab: AccountTab;
  profile: { name: string; email: string; phone: string | null; company: string | null; country: string | null };
  inquiryCards: Card[];
  inboundCards: Card[];
  listings: OwnedListing[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<AccountTab>(initialTab);

  const menu: { id: AccountTab; label: string; count?: number }[] = [
    { id: "inquiries", label: text.myInquiriesTitle, count: inquiryCards.length },
    ...(role === "dealer" ? [{ id: "inbound" as const, label: text.listingInquiriesTitle, count: inboundCards.length }] : []),
    { id: "profile", label: text.profileTitle },
    ...(role === "dealer" ? [{ id: "listings" as const, label: text.myListings, count: listings.length }] : [{ id: "sell" as const, label: text.navSell }]),
  ];

  function selectTab(next: AccountTab) {
    setTab(next);
    startTransition(() => {
      router.replace(hrefTo(lang, "/account", ctx, { tab: next }), { scroll: false });
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{text.accountTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {profile.name ? `${profile.name} · ` : ""}
          {profile.email} · {role === "dealer" ? text.roleDealer : text.roleCustomer}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-7">
        <aside className="border border-line bg-white">
          <p className="border-b border-line px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase">{text.mypageMenu}</p>
          <nav className="flex gap-1 overflow-x-auto p-2 lg:block lg:space-y-1 lg:overflow-visible" aria-label={text.mypageMenu}>
            {menu.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`flex w-auto shrink-0 items-center justify-between gap-3 px-3 py-2.5 text-left text-sm whitespace-nowrap lg:w-full ${
                    active ? "bg-[#eef3fb] font-semibold text-primary" : "text-ink hover:bg-[#f6f7f9]"
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof item.count === "number" ? <span className="text-xs text-muted tabular-nums">{item.count}</span> : null}
                </button>
              );
            })}
          </nav>
          <form action="/api/auth/logout" method="post" className="border-t border-line px-2 py-2">
            <button className="w-full px-3 py-2.5 text-left text-sm font-semibold text-muted hover:bg-[#f6f7f9]">{text.logout}</button>
          </form>
        </aside>

        <div className="min-w-0 border border-line bg-white p-5 sm:p-6">
          {tab === "inquiries" ? (
            <InquiriesPanel lang={lang} ctx={ctx} title={text.myInquiriesTitle} body={text.myInquiriesBody} empty={text.myInquiriesEmpty} cards={inquiryCards} text={text} />
          ) : null}

          {tab === "inbound" ? (
            <InboundPanel lang={lang} ctx={ctx} title={text.listingInquiriesTitle} body={text.listingInquiriesBody} empty={text.listingInquiriesEmpty} cards={inboundCards} text={text} />
          ) : null}

          {tab === "profile" ? (
            <section>
              <h2 className="text-xl font-semibold">{text.profileTitle}</h2>
              <p className="mt-2 text-sm text-muted">{text.profileBody}</p>
              <div className="mt-5 max-w-lg">
                <ProfileForm lang={lang} role={role} initial={profile} />
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
  cards: Card[];
  text: Messages;
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
                  <Link href={hrefTo(lang, `/account/inquiries/${encodeURIComponent(inquiry.id)}`, ctx)} className="text-primary underline">
                    {text.openChat}
                  </Link>
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
  cards: Card[];
  text: Messages;
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
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{inquiryStatusLabel(inquiry.status, lang)}</span>
                  <Link href={hrefTo(lang, `/account/inquiries/${encodeURIComponent(inquiry.id)}`, ctx)} className="text-primary underline">
                    {text.openChat}
                  </Link>
                </div>
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
