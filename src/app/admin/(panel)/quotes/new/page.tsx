import { notFound } from "next/navigation";
import { QuoteForm } from "@/components/admin/editors";
import { getRepository } from "@/lib/data/repository";

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ inquiry?: string }> }) {
  const { inquiry: inquiryId } = await searchParams;
  if (!inquiryId) notFound();
  const inquiry = await getRepository().getInquiry(inquiryId);
  if (!inquiry) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">견적 작성</h1>
      <div className="rounded-lg border border-line bg-white p-4">
        <QuoteForm inquiryId={inquiry.id} stockNo={inquiry.stockNo} />
      </div>
    </div>
  );
}
