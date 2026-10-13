import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Demo video",
  robots: { index: false, follow: false },
};

export default async function DemoVideoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="font-mono text-xs text-blue">DEMO</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {lang === "ko" ? "영상 파일이 없는 안내 페이지" : "This is not a vehicle video"}
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        {lang === "ko"
          ? "샘플 매물에 영상 링크 상태를 보여 주기 위한 페이지입니다. 실제 차량 영상이 아니며 자동으로 재생되지 않습니다."
          : "This page only shows the video-link state on a sample listing. It is not a recording of a vehicle and it does not play automatically."}
      </p>
    </div>
  );
}
