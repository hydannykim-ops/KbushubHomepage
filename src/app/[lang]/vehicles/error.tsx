"use client";

export default function VehiclesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16" role="alert">
      <h1 className="text-2xl font-bold">목록을 불러오지 못했습니다.</h1>
      <p className="mt-2 text-sm text-muted">The list could not be loaded.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
        다시 시도
      </button>
    </div>
  );
}
