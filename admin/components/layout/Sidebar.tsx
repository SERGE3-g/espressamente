"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, Award,
  MessageSquare, Wrench, Coffee, FileText,
  Settings, LogOut, PanelLeftClose, PanelLeft,
  Users, UserCog, Receipt, Calculator, ShieldCheck, TrendingUp, Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useSidebarStore } from "@/store/sidebar";

type NavItem =
  | { type: "link"; label: string; href: string; icon: React.ComponentType<{ className?: string }>; roles?: string[] }
  | { type: "separator"; label: string; roles?: string[] };

const nav: NavItem[] = [
  { type: "link", label: "Overview", href: "/", icon: LayoutDashboard },
  { type: "separator", label: "Catalogo" },
  { type: "link", label: "Prodotti", href: "/prodotti", icon: Package },
  { type: "link", label: "Categorie", href: "/categorie", icon: Tag, roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "link", label: "Brand", href: "/brand", icon: Award, roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "separator", label: "Richieste" },
  { type: "link", label: "Comodato", href: "/comodato", icon: Coffee },
  { type: "link", label: "Contatti", href: "/contatti", icon: MessageSquare },
  { type: "link", label: "Assistenza", href: "/assistenza", icon: Wrench },
  { type: "separator", label: "CRM", roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "link", label: "Clienti", href: "/clienti", icon: Users, roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "separator", label: "Finanze", roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "link", label: "Fatture", href: "/fatture", icon: Receipt, roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "link", label: "Contabilità", href: "/contabilita", icon: Calculator, roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "link", label: "Report P&L", href: "/contabilita/report", icon: TrendingUp, roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "separator", label: "Magazzino", roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "link", label: "Magazzino", href: "/magazzino", icon: Warehouse, roles: ["SUPER_ADMIN", "STORE_MANAGER"] },
  { type: "separator", label: "Contenuti", roles: ["SUPER_ADMIN"] },
  { type: "link", label: "Pagine CMS", href: "/pagine", icon: FileText, roles: ["SUPER_ADMIN"] },
  { type: "separator", label: "Sistema", roles: ["SUPER_ADMIN"] },
  { type: "link", label: "Dipendenti", href: "/dipendenti", icon: UserCog, roles: ["SUPER_ADMIN"] },
  { type: "link", label: "Audit Log", href: "/audit", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
  { type: "separator", label: "Account" },
  { type: "link", label: "Impostazioni", href: "/impostazioni", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { collapsed, toggle, hydrate } = useSidebarStore();

  useEffect(() => { hydrate(); }, [hydrate]);

  const userRole = user?.role ?? "";

  // Filter nav items by role
  const filteredNav = nav.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  // Remove consecutive separators and trailing separators
  const cleanNav = filteredNav.filter((item, i, arr) => {
    if (item.type === "separator") {
      const next = arr[i + 1];
      if (!next || next.type === "separator") return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-brand-950/50 backdrop-blur-sm lg:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-sidebar flex flex-col transition-all duration-200 ease-in-out",
          "lg:relative lg:z-auto",
          collapsed ? "w-[68px] -translate-x-full lg:translate-x-0" : "w-64 translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-brand-200 font-semibold text-sm tracking-wider uppercase truncate">
                Espressamente
              </p>
              <p className="text-sidebar-muted text-xs mt-0.5">Admin</p>
            </div>
          )}
          <button
            onClick={toggle}
            className="hidden lg:flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-sidebar-muted hover:text-brand-200 hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {cleanNav.map((item, i) => {
            if (item.type === "separator") {
              if (collapsed) return <div key={i} className="my-2 mx-2 border-t border-sidebar-border" />;
              return (
                <p key={i} className="px-3 pt-5 pb-1.5 text-[11px] font-semibold text-sidebar-muted uppercase tracking-wider">
                  {item.label}
                </p>
              );
            }
            const Icon = item.icon;
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg text-sm transition-all duration-150",
                  collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2",
                  isActive
                    ? "bg-accent-gold/15 text-accent-gold-light font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand-100"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent-gold" />
                )}
                <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-accent-gold")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-2 py-3 border-t border-sidebar-border">
          {user && !collapsed && (
            <div className="px-3 py-2 mb-1">
              <p className="text-sm text-brand-200 font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-sidebar-muted truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? "Esci" : undefined}
            className={cn(
              "flex items-center gap-3 w-full rounded-lg text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-red-400 transition-colors",
              collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2"
            )}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Esci</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
