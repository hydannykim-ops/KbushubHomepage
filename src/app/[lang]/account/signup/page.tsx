import Link from "next/link";
import { notFound } from "next/navigation";
import { SignupForm } from "@/components/member-forms";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";
import { DataProblem } from "@/components/catalog";

export default async function SignupPage({
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
  const role = sp.get("role") === "customer" ? "customer" : "dealer";
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{text.signupTitle}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{text.signupBody}</p>
      <p className="mt-2 text-sm text-muted">{site.source === "demo" ? text.demoFormNote : site.settings.privacyCollectionEnabled ? null : text.liveClosedNote}</p>
      <div className="relative mt-6 border border-line bg-white p-5">
        <SignupForm lang={lang} nextPath={hrefTo(lang, "/account", ctx)} defaultRole={role} />
      </div>
      <p className="mt-4 text-sm">
        <Link href={hrefTo(lang, "/account/login", ctx)} className="font-semibold text-primary">
          {text.navLogin}
        </Link>
      </p>
    </div>
  );
}
