import Link from "next/link";
import { getRepository } from "@/lib/data/repository";
import type { InquiryStatus } from "@/lib/domain/types";
import { inquiryStatusLabel } from "@/lib/labels";

const statuses: InquiryStatus[] = ["new", "consulting", "quoted", "negotiating", "contracted", "closed"];

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const inquiries = (await getRepository().listInquiries()).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visible = inquiries.filter((inquiry) => {
    if (status && inquiry.status !== status) return false;
    if (!q) return true;
    const haystack = [inquiry.name, inquiry.email, inquiry.phone, inquiry.messenger, inquiry.stockNo, inquiry.firstReferralCode]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">문의 관리</h1>
        <form className="flex flex-wrap gap-2" action="/admin/inquiries" method="get">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="이름·연락처·매물번호 검색"
            className="min-w-[14rem] rounded-md border border-line px-3 py-2 text-sm"
          />
          <button className="rounded-md border border-line px-3 py-2 text-sm font-semibold">검색</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={q ? `/admin/inquiries?q=${encodeURIComponent(q)}` : "/admin/inquiries"} className={!status ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
          전체 ({inquiries.length})
        </Link>
        {statuses.map((value) => {
          const count = inquiries.filter((item) => item.status === value).length;
          const href = q ? `/admin/inquiries?status=${value}&q=${encodeURIComponent(q)}` : `/admin/inquiries?status=${value}`;
          return (
            <Link key={value} href={href} className={status === value ? "font-semibold text-ink" : "text-muted hover:text-ink"}>
              {inquiryStatusLabel(value, "ko")} ({count})
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-3 py-2">접수</th>
              <th className="px-3 py-2">이름</th>
              <th className="px-3 py-2">연락처</th>
              <th className="px-3 py-2">매물</th>
              <th className="px-3 py-2">구분</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">최초 코드</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-line">
                  <td className="px-3 py-2">
                    <Link className="text-primary" href={`/admin/inquiries/${inquiry.id}`}>
                      {inquiry.createdAt.slice(0, 10)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link className="font-medium text-ink hover:text-primary" href={`/admin/inquiries/${inquiry.id}`}>
                      {inquiry.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{inquiry.email || inquiry.phone || inquiry.messenger || "-"}</td>
                  <td className="px-3 py-2">
                    {inquiry.stockNo ? (
                      <Link href={`/admin/vehicles/${encodeURIComponent(inquiry.stockNo)}`} className="text-primary">
                        {inquiry.stockNo}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">{inquiry.tradeMode}</td>
                  <td className="px-3 py-2">{inquiryStatusLabel(inquiry.status, "ko")}</td>
                  <td className="px-3 py-2">{inquiry.firstReferralCode ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">
                  조건에 맞는 문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
