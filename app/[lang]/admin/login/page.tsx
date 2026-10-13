import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, isLiveMode } from "@/lib/demo-accounts";
import { getDict, isLocale } from "@/lib/i18n";
import { readSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) redirect("/ko/admin/login");
  const session = await readSession();
  if (session?.role === "admin") redirect(`/${raw}/admin`);
  const dict = getDict(raw);
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-2xl font-semibold">{dict.admin.login}</h1>
      {!isLiveMode() ? (
        <p className="mt-3 text-sm leading-6 text-muted">
          {dict.admin.demoHint} {DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">{dict.errors.live}</p>
      )}
      <div className="mt-6 border border-line bg-white p-5">
        <AuthForm lang={raw} mode="admin" />
      </div>
    </div>
  );
}
