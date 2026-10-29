import type { Inquiry, InquiryMessage, InquiryMessageAuthor, Lang } from "@/lib/domain/types";
import { copy } from "@/lib/i18n";
import { inquiryStatusLabel } from "@/lib/labels";

function authorLabel(role: InquiryMessageAuthor, mine: boolean, text: ReturnType<typeof copy>) {
  if (mine) return text.chatYou;
  if (role === "buyer") return text.chatBuyer;
  if (role === "seller") return text.chatSeller;
  return text.chatStaff;
}

export function InquiryChat({
  inquiry,
  messages,
  viewerRole,
  lang,
  action,
}: {
  inquiry: Inquiry;
  messages: InquiryMessage[];
  viewerRole: InquiryMessageAuthor;
  lang: Lang;
  action: string;
}) {
  const text = copy(lang);
  const closed = inquiry.status === "closed";
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-line bg-[#f7f8fb] px-4 py-3 text-sm text-muted">
        <p>
          {inquiry.stockNo ? `${text.stockNo} ${inquiry.stockNo} · ` : ""}
          {inquiryStatusLabel(inquiry.status, lang)} · {inquiry.tradeMode}
        </p>
        <p className="mt-1">{text.inquiryChatBody}</p>
      </div>
      <ol className="grid gap-3">
        {messages.map((message) => {
          const mine = message.authorRole === viewerRole;
          return (
            <li
              key={message.id}
              className={`max-w-[92%] rounded-lg border px-3 py-2 text-sm ${mine ? "ml-auto border-primary/30 bg-[#eef4ff]" : "mr-auto border-line bg-white"}`}
            >
              <p className="text-xs font-semibold text-muted">
                {authorLabel(message.authorRole, mine, text)} · {message.createdAt.slice(0, 16).replace("T", " ")}
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-6 text-ink">{message.body}</p>
            </li>
          );
        })}
      </ol>
      {closed ? (
        <p className="text-sm text-muted">{text.chatClosed}</p>
      ) : (
        <form action={action} method="post" className="grid gap-2 border border-line bg-white p-4">
          <input type="hidden" name="lang" value={lang} />
          <label className="grid gap-1 text-sm font-medium">
            {text.chatReply}
            <textarea name="message" required maxLength={4000} rows={4} className="rounded-md border border-line px-3 py-2 font-normal" />
          </label>
          <button className="justify-self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">{text.chatSend}</button>
        </form>
      )}
    </div>
  );
}
