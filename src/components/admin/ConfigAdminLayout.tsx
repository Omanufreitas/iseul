"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string };

type Props = {
  owner: boolean;
  store: ReactNode;
  coupons: ReactNode;
  integrations?: ReactNode;
};

export function ConfigAdminLayout({ owner, store, coupons, integrations }: Props) {
  const tabs: Tab[] = owner
    ? [
        { id: "loja", label: "Loja" },
        { id: "cupons", label: "Cupons" },
        { id: "integracoes", label: "Integrações" },
      ]
    : [
        { id: "loja", label: "Loja" },
        { id: "cupons", label: "Cupons" },
      ];

  const [active, setActive] = useState(tabs[0].id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-iseul-line/80 bg-white p-1.5 shadow-card">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              active === tab.id
                ? "bg-iseul-accent text-white shadow-sm"
                : "text-iseul-muted hover:bg-neutral-100 hover:text-iseul-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {active === "loja" && store}
        {active === "cupons" && coupons}
        {active === "integracoes" && owner && integrations}
      </div>
    </div>
  );
}
