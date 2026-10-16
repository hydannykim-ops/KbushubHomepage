import { notFound } from "next/navigation";
import { copy } from "@/lib/i18n";
import { parseLang } from "@/lib/request-context";

export default async function GuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  if (!lang) notFound();
  const text = copy(lang);
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold">{text.guideTitle}</h1>
      <p className="text-sm text-muted">{text.guideNote}</p>
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-xl font-bold">{text.domesticProcess}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          {text.domesticSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-xl font-bold">{text.exportProcess}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          {text.exportSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
