"use client";

import { useFormStatus } from "react-dom";
import { startBlingOAuth } from "@/actions/bling-oauth";

function ConnectButton({ connected }: { connected: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        connected
          ? "mt-3 text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline disabled:opacity-50"
          : "mt-3 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      }
    >
      {pending
        ? "Redirecionando…"
        : connected
          ? "Reconectar Bling (opcional)"
          : "Conectar conta Bling"}
    </button>
  );
}

export function BlingConnectForm({ connected = false }: { connected?: boolean }) {
  return (
    <form action={startBlingOAuth}>
      <ConnectButton connected={connected} />
    </form>
  );
}
