import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoFrame } from "@/components/photo-frame";
import { isLocale } from "@/lib/i18n";
import { eyebrow } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Demo video",
  robots: { index: false, follow: false },
};

export default async function DemoVideoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const ko = lang === "ko";
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:py-16">
      <p className={eyebrow}>{ko ? "영상 자리" : "Video slot"}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">
        {ko ? "영상 파일이 없는 안내 페이지" : "This is not a vehicle video"}
      </h1>
      <p className="mt-4 text-base leading-7 text-muted">
        {ko
          ? "샘플 매물에 영상 링크 상태를 보여 주기 위한 페이지입니다. 실제 차량 영상이 아니며 자동으로 재생되지 않습니다."
          : "This page only shows the video-link state on a sample listing. It is not a recording of a vehicle and it does not play automatically."}
      </p>
      <div className="mt-8 overflow-hidden rounded-[1.25rem]">
        <PhotoFrame
          kicker={ko ? "영상" : "Video"}
          caption={ko ? "30–90초 워크어라운드. 자동 재생하지 않습니다." : "A 30–90 second walkaround. It will not autoplay."}
          aspect="aspect-video"
        />
      </div>
    </div>
  );
}
