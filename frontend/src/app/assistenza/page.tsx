import type { Metadata } from "next";
import { Wrench, Clock, ShieldCheck, Phone } from "lucide-react";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";
import { MotionSection, MotionStaggerParent, MotionChild } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
  title: "Assistenza — Espressamente",
  description: "Servizio di assistenza e manutenzione per macchine da caffè professionali e domestiche.",
};

const services = [
  {
    icon: Wrench,
    title: "Manutenzione ordinaria",
    description: "Pulizia, sostituzione filtri, decalcificazione e taratura della tua macchina.",
  },
  {
    icon: ShieldCheck,
    title: "Riparazioni",
    description: "Diagnosi e riparazione di guasti con ricambi originali certificati.",
  },
  {
    icon: Clock,
    title: "Intervento rapido",
    description: "Tempi di intervento rapidi per minimizzare i tempi di fermo.",
  },
  {
    icon: Phone,
    title: "Supporto telefonico",
    description: "Consulenza e supporto tecnico anche a distanza.",
  },
];

export default function AssistenzaPage() {
  return (
    <>
      {/* Page hero */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Assistenza Tecnica</h1>
          <p className="text-brand-300 text-lg max-w-2xl mx-auto">
            Il nostro team di tecnici specializzati è a tua disposizione per la manutenzione
            e la riparazione della tua macchina da caffè.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Services grid */}
        <MotionStaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {services.map((service) => (
            <MotionChild key={service.title}>
              <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-300 text-center h-full">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="font-semibold text-brand-900 mb-2">{service.title}</h3>
                <p className="text-sm text-brand-500 leading-relaxed">{service.description}</p>
              </div>
            </MotionChild>
          ))}
        </MotionStaggerParent>

        {/* Form section */}
        <MotionSection>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-900 mb-2 heading-decorated-center">
                Richiedi assistenza
              </h2>
              <p className="text-brand-500 mt-5">
                Compila il modulo e ti ricontatteremo entro 24 ore.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-brand-100 p-8">
              <ServiceRequestForm />
            </div>
          </div>
        </MotionSection>

        {/* Contact info */}
        <MotionSection delay={0.2}>
          <div className="mt-16 text-center text-brand-500 space-y-2">
            <p>Preferisci chiamarci direttamente?</p>
            <a href="tel:+390000000000" className="text-brand-900 font-bold text-lg hover:text-brand-600 transition-colors">
              +39 000 000 0000
            </a>
            <p className="text-sm">Lun–Ven 9:00–18:00, Sab 9:00–13:00</p>
          </div>
        </MotionSection>
      </div>
    </>
  );
}
