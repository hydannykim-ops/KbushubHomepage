import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { readSession } from "@/lib/auth";
import { DEMO_AGENT_EMAIL, DEMO_AGENT_PASSWORD, isLiveMode } from "@/lib/demo-accounts";
import { getDict, isLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Agent", robots: { index: false, follow: false } };

export default async function AgentLogin({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) redirect("/ko/agent/login");
  const session = await readSession();
  if (session?.role === "agent") redirect(`/${raw}/agent`);
  const dict = getDict(raw);
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-2xl font-semibold">{dict.agent.login}</h1>
      {!isLiveMode() ? <p className="mt-3 text-sm text-muted">{dict.admin.demoHint} {DEMO_AGENT_EMAIL} / {DEMO_AGENT_PASSWORD}</p> : null}
      <div className="mt-6 border border-line bg-white p-5">
        <AuthForm lang={raw} mode="agent" />
      </div>
    </div>
  );
}
