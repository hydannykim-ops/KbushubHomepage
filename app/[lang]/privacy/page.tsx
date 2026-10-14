import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(lang).privacy.title, robots: { index: false, follow: false } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDict(raw);
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      <PageIntro title={dict.privacy.title} />
      <p className="mt-6 text-base leading-8 text-muted">{dict.privacy.body}</p>
    </div>
  );
}
