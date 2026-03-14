"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Instagram } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Caffè", href: "/caffe" },
  { name: "Macchine", href: "/macchine" },
  { name: "Comodato", href: "/comodato" },
  { name: "Assistenza", href: "/assistenza" },
  { name: "Chi Siamo", href: "/chi-siamo" },
  { name: "Contatti", href: "/contatti" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
      <header
          className={`sticky top-0 z-50 transition-all duration-300 ${
              scrolled
                  ? "bg-white/95 backdrop-blur-md shadow-[var(--shadow-card)]"
                  : "bg-white"
          }`}
      >
        {/* Top bar */}
        <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 text-brand-200 text-xs py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <span className="tracking-wide">
            Concessionario di zona illy &middot; Mokador
          </span>
            <div className="flex items-center gap-4">
              <a
                  href="https://www.instagram.com/espressamente.caffe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors min-h-[44px] min-w-[44px] justify-center sm:min-w-0"
                  aria-label="Seguici su Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">@espressamente.caffe</span>
              </a>
              <a
                  href="tel:+393358256395"
                  className="flex items-center gap-1.5 hover:text-white transition-colors min-h-[44px]"
                  aria-label="Chiamaci al +39 335 825 6395"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="font-medium">+39 335 825 6395</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
              href="/"
              className="hover:opacity-80 transition-opacity"
              aria-label="Espressamente Coffee — Home"
          >
            <Logo variant="compact" theme="dark" width={200} />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                  <li key={item.href}>
                    <Link
                        href={item.href}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? "text-brand-900"
                                : "text-brand-600 hover:text-brand-900 hover:bg-brand-50"
                        }`}
                    >
                      {item.name}
                      {isActive && (
                          <span
                              className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full"
                          />
                      )}
                    </Link>
                  </li>
              );
            })}
          </ul>

          {/* Mobile toggle */}
          <button
              className="md:hidden p-2 rounded-lg hover:bg-brand-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
              aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
                <X className="w-5 h-5 text-brand-800" />
            ) : (
                <Menu className="w-5 h-5 text-brand-800" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        <div
            ref={menuRef}
            className={`md:hidden overflow-hidden border-t border-brand-100 transition-all duration-250 ease-in-out ${
                mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="bg-white px-4 sm:px-6 pb-4">
            <ul className="flex flex-col gap-1 pt-2">
              {navigation.map((item) => {
                const isActive =
                    item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                return (
                    <li key={item.href}>
                      <Link
                          href={item.href}
                          className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                              isActive
                                  ? "text-brand-900 bg-brand-50 font-semibold"
                                  : "text-brand-600 hover:text-brand-900 hover:bg-brand-50"
                          }`}
                          onClick={() => setMobileOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                );
              })}
            </ul>
          </div>
        </div>
      </header>
  );
}
