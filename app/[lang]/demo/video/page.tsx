import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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
          ? "샘플 매물에 영상 링크 상태를 보여 주기 위한 페이지입니다. 아래는 참고 정지 화면이며 실제 차량 영상이 아니고 자동으로 재생되지 않습니다."
          : "This page only shows the video-link state on a sample listing. The still below is a reference frame, not a vehicle recording, and it does not play automatically."}
      </p>
      <div className="relative mt-8 overflow-hidden rounded-[1.25rem]">
        <Image
          src="/stock/samples/l2109-front.jpg"
          alt={ko ? "참고 정지 화면" : "Reference still"}
          width={1600}
          height={900}
          className="aspect-video w-full object-cover"
        />
        <p className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium tracking-[0.16em] text-muted">
          {ko ? "영상" : "Video"}
        </p>
      </div>
    </div>
  );
}
