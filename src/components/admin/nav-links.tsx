"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/admin", "대시보드"],
  ["/admin/vehicles", "매물 관리"],
  ["/admin/inquiries", "문의 관리"],
  ["/admin/quotes", "견적 관리"],
  ["/admin/agents", "에이전트 관리"],
  ["/admin/requests", "차량 요청·매입"],
  ["/admin/settings", "사이트 설정"],
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavLinks() {
  const pathname = usePathname() || "";
  return (
    <nav className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 pb-3 text-sm">
      {links.map(([href, label]) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={["shrink-0", active ? "font-semibold text-ink" : "text-muted hover:text-ink"].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
