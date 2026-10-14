"use client";

import { useState } from "react";

export function LoginForm({ area, nextPath }: { area: "admin" | "agent"; nextPath: string }) {
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(false);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ email: form.get("email"), password: form.get("password"), area }),
        });
        setPending(false);
        if (response.ok) window.location.href = nextPath;
        else setError(true);
      }}
    >
      {error ? (
        <p role="alert" className="text-sm text-[#9f1239]">
          로그인할 수 없습니다.
        </p>
      ) : null}
      <label className="grid gap-1 text-sm font-medium">
        이메일
        <input name="email" type="email" required autoComplete="username" className="rounded-md border border-line px-3 py-2 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        비밀번호
        <input name="password" type="password" required autoComplete="current-password" className="rounded-md border border-line px-3 py-2 font-normal" />
      </label>
      <button disabled={pending} className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white">
        로그인
      </button>
    </form>
  );
}
