import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Instagram } from "lucide-react";
import { MotionSection } from "@/components/ui/MotionWrapper";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
      <footer className="bg-brand-950 text-brand-300">
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <MotionSection>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* Brand */}
              <div>
                <div className="mb-4">
                  <Logo variant="compact" theme="light" width={180} />
                </div>
                <p className="text-sm text-brand-400 leading-relaxed">
                  Caffè di qualità, macchine da caffè dei migliori brand e
                  assistenza tecnica professionale. Concessionario di zona illy e
                  Mokador.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <a
                      href="https://www.instagram.com/espressamente.caffe"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-brand-800/50 flex items-center justify-center hover:bg-brand-700 transition-colors"
                      aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-brand-300" />
                  </a>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                  Navigazione
                </h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { href: "/caffe", label: "Caffè" },
                    { href: "/macchine", label: "Macchine" },
                    { href: "/assistenza", label: "Assistenza" },
                    { href: "/chi-siamo", label: "Chi Siamo" },
                    { href: "/contatti", label: "Contatti" },
                  ].map((link) => (
                      <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-brand-400 hover:text-white transition-colors duration-200 inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>

              {/* Punti Vendita */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                  Punti Vendita
                </h4>
                <ul className="space-y-5 text-sm">
                  {/* Formia */}
                  <li>
                    <p className="text-white font-medium mb-1">Formia (LT)</p>
                    <div className="flex items-start gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-brand-500 shrink-0" />
                      <span className="text-brand-400">
                      Via Rubino 32, 04023
                    </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <a
                          href="tel:+390771010221"
                          className="text-brand-400 hover:text-white transition-colors"
                      >
                        0771 010221
                      </a>
                    </div>
                  </li>
                  {/* Minturno */}
                  <li>
                    <p className="text-white font-medium mb-1">Minturno (LT)</p>
                    <div className="flex items-start gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-brand-500 shrink-0" />
                      <span className="text-brand-400">
                      Via Luigi Cadorna 52, 04026
                    </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <a
                          href="tel:+390771065483"
                          className="text-brand-400 hover:text-white transition-colors"
                      >
                        0771 65483
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Contatti & Orari */}
              <div>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
                  Contatti
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                    <a
                        href="tel:+393358256395"
                        className="text-brand-400 hover:text-white transition-colors"
                    >
                      +39 335 825 6395
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                    <a
                        href="mailto:latino.99@virgilio.it"
                        className="text-brand-400 hover:text-white transition-colors"
                    >
                      latino.99@virgilio.it
                    </a>
                  </li>
                </ul>

                <h4 className="font-semibold text-white mt-6 mb-3 text-sm uppercase tracking-wider">
                  Orari
                </h4>
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" />
                  <div className="text-brand-400 space-y-1">
                    <p>Lun – Ven: 9:00 – 19:00</p>
                    <p>Sab: 9:00 – 13:00</p>
                    <p>Dom: Chiuso</p>
                  </div>
                </div>
              </div>
            </div>
          </MotionSection>
        </div>

        {/* Bottom */}
        <div className="border-t border-brand-800/50 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-brand-500">
            <p>
              &copy; {new Date().getFullYear()} Espressamente Coffee. Tutti i
              diritti riservati. &middot; P. IVA 01896400593
            </p>
            <p className="font-medium">espressamente.it{process.env.NEXT_PUBLIC_APP_VERSION ? ` · v${process.env.NEXT_PUBLIC_APP_VERSION}` : ""}</p>
          </div>
        </div>
      </footer>
  );
}