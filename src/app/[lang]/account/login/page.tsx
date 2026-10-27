import Link from "next/link";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";

export default async function MemberLoginPage({
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
  const text = copy(lang);
  const nextRaw = sp.get("next");
  const nextPath = nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : hrefTo(lang, "/account", ctx);
  const signupHref = nextRaw
    ? `${hrefTo(lang, "/account/signup", ctx)}&next=${encodeURIComponent(nextPath)}`
    : hrefTo(lang, "/account/signup", ctx);
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{text.navLogin}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{text.signupBody}</p>
      <div className="mt-6 border border-line bg-white p-5">
        <LoginForm
          area="member"
          nextPath={nextPath}
          labels={{ email: text.email, password: text.password, submit: text.navLogin, failed: text.loginFailed }}
        />
      </div>
      <p className="mt-4 text-sm">
        <Link href={signupHref} className="font-semibold text-primary">
          {text.navSignup}
        </Link>
      </p>
    </div>
  );
}
