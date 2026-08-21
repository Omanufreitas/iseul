"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistActionState } from "@/actions/waitlist";

const initial: WaitlistActionState = { ok: false, message: "" };

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, initial);

  if (state.ok) {
    return (
      <p className="mt-3 text-sm font-medium text-iseul-accent" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <>
      <form action={action} className="flex max-w-[440px] flex-wrap gap-2">
        <label htmlFor="waitlist-email" className="sr-only">
          Seu e-mail
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="seu@email.com"
          disabled={pending}
          className="min-w-[190px] flex-1 rounded-full border border-iseul-line bg-iseul-card px-[18px] py-3.5 text-[15px] text-iseul-ink focus:border-iseul-accent2 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-iseul-ink px-6 py-3.5 text-[15px] font-medium text-iseul-paper disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Avisar"}
        </button>
      </form>
      {state.message && !state.ok && (
        <p className="mt-2 text-sm text-iseul-sale" role="alert">
          {state.message}
        </p>
      )}
    </>
  );
}
