"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAdmin } from "@/actions/admin/auth";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inscritos", label: "Inscritos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/config", label: "Configurações" },
];

const ownerLinks = [{ href: "/admin/usuarios", label: "Usuários" }];

export function AdminShell({
  children,
  userName,
  userEmail,
  isOwner,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  isOwner: boolean;
}) {
  const links = isOwner ? [...baseLinks, ...ownerLinks] : baseLinks;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-neutral-200 text-neutral-700 lg:hidden"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
            <div>
              <Link href="/admin" className="font-serif text-2xl tracking-widest">
                ISEUL
              </Link>
              <span className="ml-2 text-xs uppercase tracking-widest text-neutral-400 sm:ml-3">
                Admin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm sm:gap-4">
            <Link href="/" className="hidden text-neutral-500 hover:text-neutral-900 sm:inline">
              Ver loja
            </Link>
            <span className="hidden max-w-[180px] truncate text-neutral-400 sm:inline">
              {userName}
            </span>
            <form action={logoutAdmin}>
              <button type="submit" className="text-neutral-500 hover:text-neutral-900">
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-6xl gap-1 px-6 pb-3 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive(l.href) ? "bg-iseul-accent text-white" : "text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="fixed left-0 top-0 z-50 flex h-full w-[min(100%,280px)] flex-col border-r bg-white p-4 shadow-xl lg:hidden">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <span className="font-medium">Menu</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="text-neutral-500">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-3 text-sm font-medium",
                    isActive(l.href) ? "bg-iseul-accent text-white" : "text-neutral-700 hover:bg-neutral-100"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto border-t pt-4 text-sm">
              <Link href="/" className="block py-2 text-neutral-500 hover:text-neutral-900">
                Ver loja
              </Link>
              <p className="truncate py-2 text-neutral-400">{userName}</p>
              <p className="truncate pb-2 text-xs text-neutral-400">{userEmail}</p>
            </div>
          </nav>
        </>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
