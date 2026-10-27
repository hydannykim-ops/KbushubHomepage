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
  const member = await site.repo.getMember(session.sub);
  const listings = session.role === "dealer" ? await site.repo.listOwned(session.sub) : [];
  const profile = {
    name: member?.name || session.name || "",
    email: member?.email || session.email,
    phone: member?.phone ?? null,
    company: member?.company ?? null,
  };
  const inquiries = await site.repo.listInquiriesByEmail(profile.email);
  const inquiryCards = await Promise.all(
    inquiries
      .filter((item) => item.stockNo)
      .slice(0, 12)
      .map(async (inquiry) => {
        const vehicle = inquiry.stockNo ? await site.repo.getPublicByStockNo(inquiry.stockNo) : null;
        return { inquiry, vehicle };
      }),
  );

  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{text.accountTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {profile.name ? `${profile.name} · ` : ""}
          {profile.email} · {session.role === "dealer" ? text.roleDealer : text.roleCustomer}
        </p>
      </div>

      <section className="border border-line bg-white p-5">
        <h2 className="text-xl font-semibold">{text.myInquiriesTitle}</h2>
        <p className="mt-2 text-sm text-muted">{text.myInquiriesBody}</p>
        {inquiryCards.length ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {inquiryCards.map(({ inquiry, vehicle }) => (
              <li key={inquiry.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
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
                  {inquiry.stockNo ? (
                    <Link href={hrefTo(lang, `/vehicles/${inquiry.stockNo}`, ctx)} className="text-primary underline">
                      {text.view}
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">{text.myInquiriesEmpty}</p>
        )}
      </section>

      <section className="border border-line bg-white p-5">
        <h2 className="text-xl font-semibold">{text.profileTitle}</h2>
        <p className="mt-2 text-sm text-muted">{text.profileBody}</p>
        <div className="mt-5">
          <ProfileForm lang={lang} role={session.role} initial={profile} />
        </div>
      </section>

      {session.role === "dealer" ? (
        <section className="border border-line bg-white p-5">
          <h2 className="text-xl font-semibold">{text.myListings}</h2>
          <p className="mt-2 text-sm text-muted">{text.reviewNote}</p>
          {listings.length ? (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {listings.map((listing) => (
                <li key={listing.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    {listing.stockNo} · {vehicleTitle(listing, lang)}
                  </span>
                  <span className="font-semibold">{statusLabel(listing.status, lang)}</span>
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
          <h2 className="text-xl font-semibold">{text.navSell}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{text.consultBody}</p>
          <Link href={hrefTo(lang, "/sell", ctx, { consult: "1" })} className="mt-4 inline-flex bg-primary px-4 py-3 text-sm font-semibold text-white">
            {text.navSell}
          </Link>
        </section>
      )}
      <form action="/api/auth/logout" method="post">
        <button className="text-sm font-semibold text-muted">{text.logout}</button>
      </form>
    </div>
  );
}
