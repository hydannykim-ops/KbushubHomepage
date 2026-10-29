import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAgent } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { copy } from "@/lib/i18n";
import { inquiryStatusLabel } from "@/lib/labels";
import { vehicleTitle } from "@/lib/domain/vehicle-catalog";
import { hrefTo, parseLang } from "@/lib/request-context";
import { siteUrl } from "@/lib/config";

export default async function AgentHome({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  if (!lang) notFound();
  const session = await requireAgent();
  if (!session?.referralCode) redirect(`/${lang}/agent/login`);
  const text = copy(lang);
  const repo = getRepository();
  const [referrals, vehicles] = await Promise.all([
    repo.agentReferrals(session.referralCode),
    repo.listPublic({}, "export"),
  ]);
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{text.agentTitle}</h1>
        <form action="/api/auth/logout" method="post">
          <button className="text-sm">{text.logout}</button>
        </form>
      </div>
      <p className="text-sm leading-6 text-muted">{text.agentBody}</p>
      <p className="text-sm">{text.partnerNote}</p>
      <section>
        <h2 className="text-xl font-bold">{text.share}</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {vehicles.items
            .filter((vehicle) => vehicle.status !== "sold")
            .map((vehicle) => {
              const path = hrefTo(lang, `/vehicles/${vehicle.stockNo}`, { mode: "export", ref: session.referralCode ?? null });
              const absolute = `${siteUrl()}${path}`;
              return (
                <li key={vehicle.id} className="rounded-md border border-line bg-white p-3">
                  <p className="font-medium">
                    {vehicle.stockNo} · {vehicleTitle(vehicle, lang)}
                  </p>
                  <Link href={path} className="break-all text-primary">
                    {absolute}
                  </Link>
                </li>
              );
            })}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-bold">{text.referrals}</h2>
        {referrals.length ? (
          <ul className="mt-3 grid gap-2 text-sm">
            {referrals.map((item) => (
              <li key={item.id} className="rounded-md border border-line bg-white p-3">
                {item.createdAt.slice(0, 10)} · {item.stockNo ?? "-"} · {item.tradeMode} · {inquiryStatusLabel(item.status, lang)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{text.noReferrals}</p>
        )}
      </section>
    </div>
  );
}
