"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { logoutAdmin } from "@/actions/admin/auth";
import type { AdminNavCounts } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "pendingOrders";
};

const baseLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inscritos", label: "Inscritos", icon: Mail },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, badgeKey: "pendingOrders" as const },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

const ownerLinks: NavLink[] = [{ href: "/admin/usuarios", label: "Usuários", icon: Users }];

export function AdminShell({
  children,
  userName,
  userEmail,
  isOwner,
  navCounts,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  isOwner: boolean;
  navCounts: AdminNavCounts;
}) {
  const links = isOwner ? [...baseLinks, ...ownerLinks] : baseLinks;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function onClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  function badgeFor(link: NavLink) {
    if (link.badgeKey === "pendingOrders" && navCounts.pendingOrders > 0) {
      return navCounts.pendingOrders;
    }
    return 0;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-40 border-b border-iseul-line/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-iseul-line text-neutral-700 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <Link href="/admin" className="font-serif text-2xl tracking-widest text-iseul-ink">
                ISEUL
              </Link>
              <span className="ml-2 text-xs uppercase tracking-widest text-iseul-muted sm:ml-3">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-iseul-muted transition hover:bg-neutral-100 hover:text-iseul-ink sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver loja
            </Link>

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-iseul-line bg-white px-2.5 py-1.5 text-sm transition hover:border-iseul-accent2"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-iseul-dew text-xs font-semibold text-iseul-accent">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate text-iseul-ink sm:inline">
                  {userName}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-neutral-400 transition", userMenuOpen && "rotate-180")}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-iseul-line bg-white shadow-card">
                  <div className="border-b px-4 py-3">
                    <p className="truncate text-sm font-medium text-iseul-ink">{userName}</p>
                    <p className="truncate text-xs text-iseul-muted">{userEmail}</p>
                  </div>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-iseul-muted hover:bg-neutral-50 sm:hidden"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver loja
                  </Link>
                  <form action={logoutAdmin}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-iseul-muted hover:bg-neutral-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-6xl gap-1 px-6 pb-3 lg:flex">
          {links.map((l) => {
            const badge = badgeFor(l);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive(l.href)
                    ? "bg-iseul-accent text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
                {badge > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      isActive(l.href) ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
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
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l) => {
                const badge = badgeFor(l);
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium",
                      isActive(l.href)
                        ? "bg-iseul-accent text-white"
                        : "text-neutral-700 hover:bg-neutral-100",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {l.label}
                    {badge > 0 && (
                      <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
