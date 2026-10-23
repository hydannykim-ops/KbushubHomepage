import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/login-form";
import { demoCredentials, getDataSource } from "@/lib/config";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  const demo = getDataSource() === "demo";
  const creds = demoCredentials();
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="flex items-center gap-3">
        <BrandLogo size="md" />
        <p className="text-lg font-bold">
          <span className="text-[#ff6a2b]">hey!</span> Bus
        </p>
      </div>
      <h1 className="mt-2 text-2xl font-bold">관리자 로그인</h1>
      {demo ? (
        <p className="mt-3 text-sm text-muted">
          데모 계정입니다. {creds.adminEmail} / {creds.adminPassword}. 운영 모드에서는 이 계정이 동작하지 않습니다.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">Supabase에 등록되고 user_roles에 admin으로 지정된 계정만 들어올 수 있습니다.</p>
      )}
      <div className="mt-6">
        <LoginForm area="admin" nextPath="/admin" />
      </div>
    </main>
  );
}
