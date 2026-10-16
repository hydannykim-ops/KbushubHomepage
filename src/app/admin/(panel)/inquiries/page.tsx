import Link from "next/link";
import { getRepository } from "@/lib/data/repository";
import { inquiryStatusLabel } from "@/lib/labels";

export default async function InquiriesPage() {
  const inquiries = await getRepository().listInquiries();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">문의 관리</h1>
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
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b border-line">
                <td className="px-3 py-2">
                  <Link className="text-primary" href={`/admin/inquiries/${inquiry.id}`}>
                    {inquiry.createdAt.slice(0, 10)}
                  </Link>
                </td>
                <td className="px-3 py-2">{inquiry.name}</td>
                <td className="px-3 py-2">{inquiry.email || inquiry.phone || inquiry.messenger || "-"}</td>
                <td className="px-3 py-2">{inquiry.stockNo ?? "-"}</td>
                <td className="px-3 py-2">{inquiry.tradeMode}</td>
                <td className="px-3 py-2">{inquiryStatusLabel(inquiry.status, "ko")}</td>
                <td className="px-3 py-2">{inquiry.firstReferralCode ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
