import { notFound } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { demoCredentials, getDataSource } from "@/lib/config";
import { copy } from "@/lib/i18n";
import { parseLang } from "@/lib/request-context";

export default async function AgentLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  if (!lang) notFound();
  const text = copy(lang);
  const demo = getDataSource() === "demo";
  const creds = demoCredentials();
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">{text.agentLogin}</h1>
      {demo ? (
        <p className="mt-3 text-sm text-muted">
          Demo account {creds.agentEmail} / {creds.agentPassword}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">{text.loginFailed}</p>
      )}
      <div className="mt-6">
        <LoginForm area="agent" nextPath={`/${lang}/agent`} />
      </div>
    </div>
  );
}
