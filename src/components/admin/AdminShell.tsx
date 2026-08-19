"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/actions/admin/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/config", label: "Configurações" },
];

export function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/admin" className="font-serif text-2xl tracking-widest">
              ISEUL
            </Link>
            <span className="ml-3 text-xs uppercase tracking-widest text-neutral-400">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-500 hover:text-neutral-900">
              Ver loja
            </Link>
            <span className="text-neutral-400">{userName}</span>
            <form action={logoutAdmin}>
              <button type="submit" className="text-neutral-500 hover:text-neutral-900">
                Sair
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-6 pb-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href))
                  ? "bg-iseul-accent text-white"
                  : "text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
