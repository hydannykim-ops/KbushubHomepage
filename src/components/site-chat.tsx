"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { chatUi, chatWelcome, type ChatLink } from "@/lib/chat/engine";
import type { Lang } from "@/lib/domain/types";

type Bubble = {
  id: string;
  role: "user" | "bot";
  text: string;
  links?: ChatLink[];
  suggestions?: string[];
};

function withQuery(path: string, ref: string | null) {
  const [base, existing = ""] = path.split("?");
  const params = new URLSearchParams(existing);
  params.delete("mode");
  if (ref) params.set("ref", ref);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function SiteChat({ lang, refCode }: { lang: Lang; refCode: string | null }) {
  const ui = chatUi[lang] ?? chatUi.en;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Bubble[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const liveRef = searchParams.get("ref") || refCode;

  useEffect(() => {
    if (!open || messages.length) return;
    const welcome = chatWelcome(lang);
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: welcome.text,
        links: welcome.links,
        suggestions: welcome.suggestions,
      },
    ]);
  }, [open, lang, messages.length]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Hide on admin routes.
  if (pathname.startsWith("/admin")) return null;

  // Vehicle detail has a fixed mobile CTA bar (~90px) — clear it with room for the FAB height.
  const onVehicleDetail = /\/vehicles\/[^/]+$/.test(pathname);
  const shellClass = [
    "pointer-events-none fixed right-4 z-50 flex flex-col items-end gap-3 md:right-6",
    onVehicleDetail ? "bottom-28 md:bottom-6" : "bottom-4 md:bottom-6",
  ].join(" ");

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setDraft("");
    setPending(true);
    const userId = `u-${Date.now()}`;
    setMessages((current) => [...current, { id: userId, role: "user", text: trimmed }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ lang, message: trimmed }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        text?: string;
        links?: ChatLink[];
        suggestions?: string[];
      };
      setMessages((current) => [
        ...current,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: data.ok && data.text ? data.text : chatWelcome(lang).text,
          links: data.links,
          suggestions: data.suggestions,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: lang === "ko" ? "일시적으로 연결되지 않았습니다. 잠시 후 다시 시도해 주세요." : "Connection failed. Please try again.",
          suggestions: chatWelcome(lang).suggestions,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  function hrefFor(link: ChatLink) {
    const path = link.href.startsWith("/") ? link.href : `/${link.href}`;
    return `/${lang}${withQuery(path, liveRef)}`;
  }

  return (
    <div className={shellClass} data-site-chat>
      {open ? (
        <section
          className="pointer-events-auto flex h-[min(32rem,calc(100vh-6rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden border border-line bg-white shadow-[0_16px_40px_rgba(16,32,51,0.18)]"
          aria-label={ui.title}
        >
          <header className="flex items-start justify-between gap-3 border-b border-line bg-ink px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold tracking-wide">{ui.title}</p>
              <p className="mt-0.5 text-xs text-white/70">{ui.subtitle}</p>
            </div>
            <button type="button" className="text-xs font-medium text-white/80 hover:text-white" onClick={() => setOpen(false)}>
              {ui.close}
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-[#f3f5f8] px-3 py-3">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ml-8" : "mr-6"}>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {message.role === "user" ? ui.you : ui.bot}
                </p>
                <div
                  className={[
                    "px-3 py-2.5 text-sm leading-6",
                    message.role === "user" ? "bg-ink text-white" : "border border-line bg-white text-ink",
                  ].join(" ")}
                >
                  {message.text}
                </div>
                {message.links?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={hrefFor(link)}
                        className="inline-flex border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:border-ink"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
                {message.role === "bot" && message.suggestions?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="border border-[#cfd5df] bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-[#e8ebf0]"
                        disabled={pending}
                        onClick={() => ask(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form
            className="grid grid-cols-[1fr_auto] gap-2 border-t border-line bg-white p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void ask(draft);
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={ui.placeholder}
              className="border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink"
              maxLength={500}
              disabled={pending}
              aria-label={ui.placeholder}
            />
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              className="bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {ui.send}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="pointer-events-auto bg-ink px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,32,51,0.22)]"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? ui.close : ui.open}
      </button>
    </div>
  );
}
