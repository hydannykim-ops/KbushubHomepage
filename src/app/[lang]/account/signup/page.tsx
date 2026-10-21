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
  const roleParam = sp.get("role");
  const role = roleParam === "customer" || roleParam === "dealer" ? roleParam : null;

  if (!role) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{text.signupTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{text.signupChooseBody}</p>
        <p className="mt-2 text-sm text-muted">{site.source === "demo" ? text.demoFormNote : site.settings.privacyCollectionEnabled ? null : text.liveClosedNote}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href={hrefTo(lang, "/account/signup", ctx, { role: "dealer" })}
            className="group flex min-h-56 flex-col justify-between border border-line bg-white p-6 transition-shadow hover:shadow-[0_10px_30px_rgba(16,32,51,0.08)]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted">DEALER</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{text.roleDealer}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{text.roleDealerBody}</p>
            </div>
            <span className="mt-8 inline-flex bg-ink px-4 py-3 text-sm font-semibold text-white group-hover:bg-primary">{text.signupDealerCta}</span>
          </Link>

          <Link
            href={hrefTo(lang, "/account/signup", ctx, { role: "customer" })}
            className="group flex min-h-56 flex-col justify-between border border-line bg-white p-6 transition-shadow hover:shadow-[0_10px_30px_rgba(16,32,51,0.08)]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-muted">CUSTOMER</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">{text.roleCustomer}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{text.roleCustomerBody}</p>
            </div>
            <span className="mt-8 inline-flex border border-line bg-white px-4 py-3 text-sm font-semibold text-ink group-hover:border-ink">{text.signupCustomerCta}</span>
          </Link>
        </div>

        <p className="mt-6 text-sm">
          <Link href={hrefTo(lang, "/account/login", ctx)} className="font-semibold text-primary">
            {text.navLogin}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted">{role === "dealer" ? "DEALER" : "CUSTOMER"}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{role === "dealer" ? text.roleDealer : text.roleCustomer}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{role === "dealer" ? text.roleDealerBody : text.roleCustomerBody}</p>
      <p className="mt-2 text-sm text-muted">{site.source === "demo" ? text.demoFormNote : site.settings.privacyCollectionEnabled ? null : text.liveClosedNote}</p>
      <div className="relative mt-6 border border-line bg-white p-5">
        <SignupForm lang={lang} nextPath={hrefTo(lang, "/account", ctx)} role={role} />
      </div>
      <p className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href={hrefTo(lang, "/account/signup", ctx)} className="font-semibold text-muted hover:text-ink">
          {text.signupBackRoles}
        </Link>
        <Link href={hrefTo(lang, "/account/login", ctx)} className="font-semibold text-primary">
          {text.navLogin}
        </Link>
      </p>
    </div>
  );
}
