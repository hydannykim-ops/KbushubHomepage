import type { ReactNode } from "react";

/** Desktop: form sticks while story content scrolls. Mobile: intro → form → rest. */
export function StickyQuoteLayout({
  intro,
  form,
  children,
}: {
  intro: ReactNode;
  form: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] lg:items-start lg:gap-x-10">
        <div className="min-w-0">{intro}</div>
        <aside
          id="quote"
          className="min-w-0 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100vh-6.5rem)] lg:self-start lg:overflow-y-auto"
        >
          {form}
        </aside>
        <div className="grid min-w-0 gap-10 lg:col-start-1 lg:row-start-2 lg:gap-12">{children}</div>
      </div>
    </div>
  );
}
