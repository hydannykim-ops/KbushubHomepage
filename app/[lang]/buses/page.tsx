import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { PageIntro } from "@/components/page-intro";
import { getDict, isLocale } from "@/lib/i18n";
import { hrefFor } from "@/lib/paths";
import { tradeMode } from "@/lib/request-context";
import { publicData } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).buses.title, description: getDict(lang).buses.lead };
}

export default async function BusesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const trade = await tradeMode();
  const data = await publicData();
  if (!data.ok) return null;
  const dict = getDict(raw);
  const groups = [
    ["medium", dict.buses.medium],
    ["large", dict.buses.large],
  ] as const;
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <PageIntro title={dict.buses.title} lead={dict.buses.lead} />
      {groups.map(([key, label]) => {
        const items = data.vehicles.filter((vehicle) => vehicle.class === key && vehicle.status !== "hidden").slice(0, 4);
        return (
          <section key={key} className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xl font-semibold">{label}</h2>
              <Link href={hrefFor(raw, "/inventory", trade, { class: key })} className="text-sm font-semibold text-blue">{dict.buses.more}</Link>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {items.map((vehicle) => (
                <ListingCard key={vehicle.id} vehicle={vehicle} lang={raw} trade={trade} layout="grid" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
