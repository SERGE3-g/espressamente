"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    document.cookie = "cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax";
    setVisible(false);
  }

  function reject() {
    localStorage.setItem("cookie_consent", "rejected");
    document.cookie = "cookie_consent=rejected; path=/; max-age=31536000; SameSite=Lax";
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div role="region" aria-label="Consenso cookie" className="fixed bottom-0 left-0 right-0 z-50 bg-brand-950/95 backdrop-blur-sm border-t border-brand-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-brand-200 flex-1 leading-relaxed">
          Utilizziamo cookie tecnici necessari al funzionamento del sito e, previo consenso, cookie analitici per migliorare l&apos;esperienza.{" "}
          <Link href="/cookie-policy" className="underline hover:text-white transition-colors">
            Cookie Policy
          </Link>{" "}
          &mdash;{" "}
          <Link href="/privacy-policy" className="underline hover:text-white transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm border border-brand-600 text-brand-300 rounded-lg hover:bg-brand-800 hover:text-white transition-colors"
          >
            Solo necessari
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-accent-gold text-brand-950 font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
}
