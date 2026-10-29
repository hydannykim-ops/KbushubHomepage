import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <Link href="/ko" className="mt-4 inline-block text-primary">
        K-BUS HUB
      </Link>
    </div>
  );
}
