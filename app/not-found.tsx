import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24">
      <p className="font-mono text-xs text-blue">404</p>
      <h1 className="mt-3 text-3xl font-semibold">페이지를 찾지 못했습니다</h1>
      <p className="mt-3 text-sm text-muted">Page not found. The address changed, or the listing is not public.</p>
      <Link href="/ko" className="mt-8 inline-flex h-11 items-center bg-blue px-4 text-sm font-semibold text-white">
        메인으로
      </Link>
    </main>
  );
}
