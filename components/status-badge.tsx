import { getDict } from "@/lib/i18n";
import type { Locale, SaleStatus } from "@/lib/types";

const tone: Record<SaleStatus, string> = {
  available: "bg-[#e7f6ee] text-[#0f6b45]",
  reserved: "bg-[#fbf3e2] text-[#8a5a00]",
  sold: "bg-[#eef0f3] text-[#4b5565]",
  hidden: "bg-[#eef0f3] text-[#4b5565]",
};

export function StatusBadge({ status, lang }: { status: SaleStatus; lang: Locale }) {
  const label = getDict(lang).status[status];
  return <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold ${tone[status]}`}>{label}</span>;
}
