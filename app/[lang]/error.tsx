"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-2xl font-semibold">화면을 불러오지 못했습니다</h1>
      <p className="mt-3 text-sm text-muted">This page could not be loaded.</p>
      <button type="button" onClick={reset} className="mt-6 inline-flex h-11 items-center bg-blue px-4 text-sm font-semibold text-white">
        다시 시도
      </button>
    </div>
  );
}
