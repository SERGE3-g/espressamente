import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, Instagram, Smartphone } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { MotionSection } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
  title: "Contatti — Espressamente",
  description:
      "Contattaci per informazioni, preventivi o assistenza. Due punti vendita: Formia e Minturno.",
};

/* ── Dati sedi ── */
const stores = [
  {
    city: "Formia",
    province: "LT",
    address: "Via Rubino 32, 04023 Formia (LT)",
    phone: "0771 010221",
    phoneFull: "+390771010221",
    mapQuery: "Via+Rubino+32+04023+Formia+LT",
  },
  {
    city: "Minturno",
    province: "LT",
    address: "Via Luigi Cadorna 52, 04026 Minturno (LT)",
    phone: "0771 65483",
    phoneFull: "+390771065483",
    mapQuery: "Via+Luigi+Cadorna+52+04026+Minturno+LT",
  },
];

/* ── Contatti generali ── */
const generalContacts = [
  {
    icon: Smartphone,
    label: "Cellulare",
    lines: ["+39 335 825 6395"],
    href: "tel:+393358256395",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["latino.99@virgilio.it"],
    href: "mailto:latino.99@virgilio.it",
  },
  {
    icon: Instagram,
    label: "Social",
    lines: ["@espressamente.caffe"],
    href: "https://www.instagram.com/espressamente.caffe",
  },
  {
    icon: Clock,
    label: "Orari",
    lines: [
      "Lun–Ven: 9:00–18:00",
      "Sabato: 9:00–13:00",
      "Domenica: chiuso",
    ],
  },
];

export default function ContattiPage() {
  return (
      <>
        {/* ── Page hero ── */}
        <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3">
              Contatti
            </h1>
            <p className="text-brand-300 text-lg max-w-xl">
              Siamo qui per rispondere a tutte le tue domande. Vieni a trovarci
              nei nostri punti vendita a Formia e Minturno.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          {/* ── Punti vendita ── */}
          <MotionSection>
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-8 heading-decorated">
              Punti Vendita
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {stores.map((store) => (
                  <div
                      key={store.city}
                      className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-brand-100 p-8 flex flex-col gap-5"
                  >
                    <h3 className="font-heading text-2xl font-bold text-brand-900">
                      {store.city}{" "}
                      <span className="text-brand-400 text-base font-normal">
                    ({store.province})
                  </span>
                    </h3>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                      <a
                          href={`https://maps.google.com/?q=${store.mapQuery}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-700 hover:text-brand-600 transition-colors"
                      >
                        {store.address}
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-brand-600 flex-shrink-0" />
                      <a
                          href={`tel:${store.phoneFull}`}
                          className="text-brand-900 font-medium hover:text-brand-600 transition-colors"
                      >
                        {store.phone}
                      </a>
                    </div>

                    {/* Embed mappa (opzionale — sostituire con API key reale) */}
                    <div className="mt-2 rounded-xl overflow-hidden border border-brand-100 aspect-video">
                      <iframe
                          title={`Mappa ${store.city}`}
                          src={`https://www.google.com/maps?q=${store.mapQuery}&output=embed`}
                          className="w-full h-full"
                          loading="lazy"
                          allowFullScreen
                      />
                    </div>
                  </div>
              ))}
            </div>
          </MotionSection>

          {/* ── Contatti generali + Form ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info colonna sinistra */}
            <MotionSection>
              <div>
                <h2 className="font-heading text-xl font-bold text-brand-900 mb-8 heading-decorated">
                  Contatti Diretti
                </h2>
                <p className="text-brand-600 mb-6">
                  Referente:{" "}
                  <span className="font-semibold text-brand-900">
                  Tommaso Fusco
                </span>
                </p>
                <div className="space-y-6">
                  {generalContacts.map((item) => (
                      <div key={item.label} className="flex gap-4">
                        <div className="w-11 h-11 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-brand-400 uppercase tracking-wider mb-1">
                            {item.label}
                          </p>
                          {item.lines.map((line, i) =>
                              item.href && i === 0 ? (
                                  <a
                                      key={i}
                                      href={item.href}
                                      target={
                                        item.href.startsWith("http") ? "_blank" : undefined
                                      }
                                      rel={
                                        item.href.startsWith("http")
                                            ? "noopener noreferrer"
                                            : undefined
                                      }
                                      className="block text-brand-900 font-medium hover:text-brand-600 transition-colors"
                                  >
                                    {line}
                                  </a>
                              ) : (
                                  <p key={i} className="text-brand-700">
                                    {line}
                                  </p>
                              )
                          )}
                        </div>
                      </div>
                  ))}
                </div>

                {/* Dati fiscali (footer piccolo) */}
                <div className="mt-10 pt-6 border-t border-brand-100">
                  <p className="text-xs text-brand-400">
                    P. IVA 01896400593 · SDI 0000000
                  </p>
                  <p className="text-xs text-brand-400 mt-1">
                    Concessionario di zona illy · Mokador
                  </p>
                </div>
              </div>
            </MotionSection>

            {/* Form colonna destra */}
            <MotionSection delay={0.2}>
              <div>
                <h2 className="font-heading text-xl font-bold text-brand-900 mb-8 heading-decorated">
                  Invia un messaggio
                </h2>
                <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-brand-100 p-8">
                  <ContactForm />
                </div>
              </div>
            </MotionSection>
          </div>
        </div>
      </>
  );
}