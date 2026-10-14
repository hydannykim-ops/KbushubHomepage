import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { copy } from "@/lib/i18n";
import { parseLang } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  if (!lang) notFound();
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);
  const policy = lang === "ko" ? site.settings.privacyPolicyKo : site.settings.privacyPolicyEn;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{text.privacyTitle}</h1>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{policy || text.liveClosedNote}</p>
      <p className="mt-4 text-sm text-muted">
        {site.settings.privacyCollectionEnabled
          ? lang === "ko"
            ? "실제 문의 수집이 켜져 있습니다."
            : "Live inquiry collection is enabled."
          : text.liveClosedNote}
      </p>
    </div>
  );
}
