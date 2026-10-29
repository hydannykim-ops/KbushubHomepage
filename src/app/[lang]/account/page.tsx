import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { copy } from "@/lib/i18n";
import { statusLabel } from "@/lib/labels";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";
import { DataProblem } from "@/components/catalog";

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
  const listings = session.role === "dealer" ? await site.repo.listOwned(session.sub) : [];
  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{text.accountTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {session.name ? `${session.name} · ` : ""}
          {session.email} · {session.role === "dealer" ? text.roleDealer : text.roleCustomer}
        </p>
      </div>
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
