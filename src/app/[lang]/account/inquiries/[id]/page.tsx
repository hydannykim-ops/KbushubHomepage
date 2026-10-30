import Link from "next/link";
import { notFound } from "next/navigation";
import { DataProblem } from "@/components/catalog";
import { InquiryChat } from "@/components/inquiry-chat";
import { getSession } from "@/lib/auth/session";
import { copy } from "@/lib/i18n";
import { hrefTo, parseLang, requestContext } from "@/lib/request-context";
import { loadSite } from "@/lib/site-load";

export default async function AccountInquiryChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: raw, id } = await params;
  const lang = parseLang(raw);
  if (!lang) notFound();
  const rawParams = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) if (typeof value === "string") sp.set(key, value);
  const ctx = await requestContext(lang, sp);
  const site = await loadSite();
  if (!site.ok) return <DataProblem lang={lang} code={site.code} />;
  const text = copy(lang);
  const session = await getSession();
  if (!session || (session.role !== "customer" && session.role !== "dealer")) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-semibold">{text.inquiryChat}</h1>
        <p className="mt-3 text-sm text-muted">{text.guestSellBody}</p>
        <Link href={hrefTo(lang, "/account/login", ctx)} className="mt-4 inline-flex bg-primary px-4 py-3 text-sm font-semibold text-white">
          {text.navLogin}
        </Link>
      </div>
    );
  }

  const thread = await site.repo.openInquiryThread(id, {
    memberId: session.sub,
    email: session.email,
  });
  if (!thread) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-semibold">{text.notFound}</h1>
        <Link href={hrefTo(lang, "/account", ctx)} className="mt-4 inline-block text-primary">
          {text.backToAccount}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <div>
        <Link href={hrefTo(lang, "/account", ctx)} className="text-sm text-primary">
          ← {text.backToAccount}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{text.inquiryChat}</h1>
        <p className="mt-2 text-sm text-muted">{thread.inquiry.name}</p>
      </div>
      <InquiryChat
        inquiry={thread.inquiry}
        messages={thread.messages}
        viewerRole={thread.viewerRole}
        lang={lang}
        action={`/api/account/inquiries/${encodeURIComponent(thread.inquiry.id)}/messages`}
      />
    </div>
  );
}
