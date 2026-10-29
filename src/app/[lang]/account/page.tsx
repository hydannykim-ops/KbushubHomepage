import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { copy } from "@/lib/i18n";
import { inquiryStatusLabel, statusLabel } from "@/lib/labels";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import type { InquiryThreadSummary } from "@/lib/domain/types";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";
import { DataProblem } from "@/components/catalog";

function InquiryList({
  items,
  empty,
  lang,
  href,
}: {
  items: InquiryThreadSummary[];
  empty: string;
  lang: Parameters<typeof copy>[0];
  href: (path: string) => string;
}) {
  if (!items.length) return <p className="mt-4 text-sm text-muted">{empty}</p>;
  const text = copy(lang);
  return (
    <ul className="mt-4 divide-y divide-line border-y border-line">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={href(`/account/inquiries/${encodeURIComponent(item.id)}`)} className="block py-3 hover:text-primary">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">
                {item.stockNo ? `${item.stockNo} · ` : ""}
                {inquiryStatusLabel(item.status, lang)}
              </span>
              <span className="shrink-0 text-xs text-muted">{item.lastMessageAt.slice(0, 10)}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{item.lastMessagePreview}</p>
            <span className="mt-2 inline-block text-xs font-semibold text-primary">{text.openChat}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
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
  const member = { id: session.sub, email: session.email };
  const myInquiries = await site.repo.listMemberInquiries(member);
  const listingInquiries = session.role === "dealer" ? await site.repo.listOwnerInquiries(session.sub) : [];
  const listings = session.role === "dealer" ? await site.repo.listOwned(session.sub) : [];
  const path = (p: string) => hrefTo(lang, p, ctx);

  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{text.accountTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {session.name ? `${session.name} · ` : ""}
          {session.email} · {session.role === "dealer" ? text.roleDealer : text.roleCustomer}
        </p>
      </div>

      <section className="border border-line bg-white p-5">
        <h2 className="text-xl font-semibold">{text.myInquiries}</h2>
        <p className="mt-2 text-sm text-muted">{text.inquiryChatBody}</p>
        <InquiryList items={myInquiries} empty={text.noInquiries} lang={lang} href={path} />
      </section>

      {session.role === "dealer" ? (
        <section className="border border-line bg-white p-5">
          <h2 className="text-xl font-semibold">{text.listingInquiries}</h2>
          <p className="mt-2 text-sm text-muted">{text.inquiryChatBody}</p>
          <InquiryList items={listingInquiries} empty={text.noListingInquiries} lang={lang} href={path} />
        </section>
      ) : null}

      {session.role === "dealer" ? (
        <section className="border border-line bg-white p-5">
          <h2 className="text-xl font-semibold">{text.myListings}</h2>
          <p className="mt-2 text-sm text-muted">{text.reviewNote}</p>
          {listings.length ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={hrefTo(lang, `/vehicles/${encodeURIComponent(listing.stockNo)}`, ctx)}
                    className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary"
                  >
                    <span>
                      {listing.stockNo} · {vehicleTitle(listing, lang)}
                    </span>
                    <span className="shrink-0 font-semibold text-ink">{statusLabel(listing.status, lang)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">{text.noListings}</p>
          )}
          <Link href={hrefTo(lang, "/sell", ctx)} className="mt-4 inline-flex bg-primary px-4 py-3 text-sm font-semibold text-white">
            {text.navSell}
          </Link>
        </section>
      ) : (
        <section className="border border-line bg-white p-5">
          <h2 className="text-xl font-semibold">{text.consultTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.customerBlocked}</p>
          <Link href={hrefTo(lang, "/sell", ctx, { consult: "1" })} className="mt-4 inline-flex bg-primary px-4 py-3 text-sm font-semibold text-white">
            {text.consultButton}
          </Link>
        </section>
      )}
      <form action="/api/auth/logout" method="post">
        <button className="text-sm font-semibold text-muted">{text.logout}</button>
      </form>
    </div>
  );
}
