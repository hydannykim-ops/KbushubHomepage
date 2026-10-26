import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminToastHost } from "@/components/admin/saved-toast";
import { BrandLogo } from "@/components/brand-logo";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const links = [
  ["/admin", "대시보드"],
  ["/admin/vehicles", "매물 관리"],
  ["/admin/inquiries", "문의 관리"],
  ["/admin/quotes", "견적 관리"],
  ["/admin/agents", "에이전트 관리"],
  ["/admin/requests", "차량 요청·매입"],
  ["/admin/settings", "사이트 설정"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <p className="font-bold">
              K-BUS HUB <span className="font-semibold text-muted">관리</span>
            </p>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm text-muted">로그아웃</button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 pb-3 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="shrink-0">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      <Suspense fallback={null}>
        <AdminToastHost />
      </Suspense>
    </div>
  );
}
