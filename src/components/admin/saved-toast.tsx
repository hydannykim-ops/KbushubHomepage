"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY = "kb-admin-toast";
const EVENT_NAME = "kb-admin-toast";

type ToastPayload = { message: string };

export function notifyAdminSaved(message = "저장되었습니다.") {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, message);
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new CustomEvent<ToastPayload>(EVENT_NAME, { detail: { message } }));
}

function readStored(): string | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (value) sessionStorage.removeItem(STORAGE_KEY);
    return value;
  } catch {
    return null;
  }
}

export function AdminToastHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStored();
    if (stored) setMessage(stored);

    function onToast(event: Event) {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      if (detail?.message) setMessage(detail.message);
    }
    window.addEventListener(EVENT_NAME, onToast);
    return () => window.removeEventListener(EVENT_NAME, onToast);
  }, []);

  useEffect(() => {
    const saved = searchParams.get("saved");
    if (!saved) return;
    if (saved === "deleted") setMessage("삭제되었습니다.");
    else if (saved === "uploaded") setMessage("사진을 올렸습니다.");
    else setMessage("저장되었습니다.");
    const next = new URLSearchParams(searchParams.toString());
    next.delete("saved");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[60] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 border border-line bg-ink px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_32px_rgba(16,32,51,0.28)]"
      data-admin-toast
    >
      {message}
    </div>
  );
}
