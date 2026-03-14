"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ChevronRight, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";
import { useState, useRef, useEffect } from "react";

const breadcrumbMap: Record<string, string> = {
  "": "Overview",
  prodotti: "Prodotti",
  nuovo: "Nuovo",
  categorie: "Categorie",
  brand: "Brand",
  comodato: "Comodato",
  contatti: "Contatti",
  assistenza: "Assistenza",
  pagine: "Pagine CMS",
  impostazioni: "Impostazioni",
};

export function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggle = useSidebarStore((s) => s.toggle);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Home", href: "/" }];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    crumbs.push({ label: breadcrumbMap[seg] || seg, href: path });
  }

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-200 bg-white/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggle}
          className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-brand-500 hover:bg-brand-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-brand-300" />}
              {i < crumbs.length - 1 ? (
                <Link href={crumb.href} className="text-brand-400 hover:text-brand-600 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-brand-800 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Mobile: just page title */}
        <span className="sm:hidden text-sm font-medium text-brand-800">
          {crumbs[crumbs.length - 1]?.label}
        </span>
      </div>

      {/* Avatar dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-brand-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center shadow-sm">
            <span className="text-xs font-semibold text-brand-100">{initials}</span>
          </div>
          {user && (
            <span className="hidden md:block text-sm text-brand-700 font-medium max-w-[120px] truncate">
              {user.fullName}
            </span>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-brand-200 bg-white shadow-elevated py-1 animate-fade-in">
            {user && (
              <div className="px-3 py-2 border-b border-brand-100">
                <p className="text-sm font-medium text-brand-800 truncate">{user.fullName}</p>
                <p className="text-xs text-brand-400 truncate">{user.email}</p>
              </div>
            )}
            <Link
              href="/impostazioni"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Impostazioni
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
