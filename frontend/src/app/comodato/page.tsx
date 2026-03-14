import type { Metadata } from "next";
import { MotionSection, MotionStaggerParent, MotionChild } from "@/components/ui/MotionWrapper";
import { ComodatoForm } from "@/components/forms/ComodatoForm";
import { api } from "@/lib/api";
import { Truck, Wrench, Coffee, RotateCcw, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Comodato d'uso macchine caffè — Espressamente",
  description:
    "Ottieni una macchina da caffè professionale in comodato gratuito. Consegna a domicilio, assistenza inclusa, nessun costo fisso.",
};

export const dynamic = "force-dynamic";

const vantaggi = [
  {
    icon: Truck,
    title: "Consegna gratuita",
    desc: "Portiamo la macchina direttamente a casa tua o nella tua attività, senza costi di spedizione.",
  },
  {
    icon: Wrench,
    title: "Assistenza tecnica inclusa",
    desc: "Interventi tecnici a domicilio senza costi aggiuntivi per tutta la durata del comodato.",
  },
  {
    icon: Coffee,
    title: "Ampia scelta di caffè",
    desc: "Accesso a tutta la nostra selezione di miscele, cialde e capsule delle migliori torrefazioni.",
  },
  {
    icon: RotateCcw,
    title: "Massima flessibilità",
    desc: "Puoi restituire la macchina quando vuoi, senza penali né vincoli contrattuali.",
  },
];

const steps = [
  {
    step: "01",
    title: "Scegli la macchina",
    desc: "Seleziona il modello che fa per te tra le nostre macchine da caffè professionali.",
  },
  {
    step: "02",
    title: "Compila il modulo",
    desc: "Inserisci i tuoi dati e le preferenze di consegna nel form qui sotto.",
  },
  {
    step: "03",
    title: "Ti contattiamo",
    desc: "Entro 24 ore lavorative ti richiamiamo per concordare tutti i dettagli.",
  },
];

export default async function ComodatoPage() {
  // Carica macchine disponibili per la selezione nel form
  let machines: Awaited<ReturnType<typeof api.products.getAll>>["content"] = [];
  try {
    const res = await api.products.getAll(0, 12, "MACCHINA");
    machines = res.content.filter((p) => p.isFeatured || true); // mostra tutte
  } catch {
    // fallback: form senza selezione macchina
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <div className="max-w-3xl">
              <p className="text-brand-300 text-sm font-medium uppercase tracking-widest mb-4">
                Servizio comodato d'uso
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                La macchina da caffè
                <span className="text-brand-300"> perfetta</span>,
                <br />senza acquistarla
              </h1>
              <p className="mt-6 text-brand-200 text-lg leading-relaxed max-w-2xl">
                Ti diamo in comodato gratuito una macchina da caffè professionale.
                In cambio, acquisti il caffè da noi. Nessun costo fisso, assistenza inclusa,
                possibilità di reso in qualsiasi momento.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <a
                  href="#form-comodato"
                  className="inline-flex items-center gap-2 bg-white text-brand-900 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors"
                >
                  Richiedi ora <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </MotionSection>
        </div>
      </div>

      {/* Vantaggi */}
      <section className="bg-brand-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <h2 className="font-heading text-3xl font-bold text-brand-900 text-center mb-12">
              Perché scegliere il comodato
            </h2>
          </MotionSection>
          <MotionStaggerParent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vantaggi.map((v) => {
              const Icon = v.icon;
              return (
                <MotionChild key={v.title}>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100 h-full">
                    <div className="w-12 h-12 rounded-xl bg-brand-800 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-brand-900 mb-2">{v.title}</h3>
                    <p className="text-sm text-brand-600 leading-relaxed">{v.desc}</p>
                  </div>
                </MotionChild>
              );
            })}
          </MotionStaggerParent>
        </div>
      </section>

      {/* Come funziona */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <h2 className="font-heading text-3xl font-bold text-brand-900 text-center mb-12">
              Come funziona
            </h2>
          </MotionSection>
          <MotionStaggerParent className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <MotionChild key={s.step}>
                <div className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-brand-200" />
                  )}
                  <div className="w-16 h-16 rounded-full bg-brand-900 text-white font-heading text-xl font-bold flex items-center justify-center mx-auto mb-4 relative z-10">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-brand-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-brand-600 leading-relaxed">{s.desc}</p>
                </div>
              </MotionChild>
            ))}
          </MotionStaggerParent>
        </div>
      </section>

      {/* Cosa è incluso */}
      <section className="bg-brand-900 text-white py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <MotionSection>
            <h2 className="font-heading text-2xl font-bold text-center mb-8">
              Cosa è incluso nel comodato
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Macchina da caffè professionale senza costi di acquisto",
                "Installazione e configurazione iniziale",
                "Formazione sull'utilizzo della macchina",
                "Assistenza tecnica a domicilio inclusa",
                "Manutenzione ordinaria periodica",
                "Sostituzione macchina in caso di guasto",
                "Nessun contratto a lungo termine obbligatorio",
                "Restituzione libera in qualsiasi momento",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-300 shrink-0 mt-0.5" />
                  <span className="text-brand-200 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </MotionSection>
        </div>
      </section>

      {/* Form */}
      <section id="form-comodato" className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <MotionSection>
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl font-bold text-brand-900">
                Richiedi il comodato
              </h2>
              <p className="mt-3 text-brand-600">
                Compila il modulo e ti ricontattiamo entro 24 ore lavorative.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-8">
              <ComodatoForm machines={machines} />
            </div>
          </MotionSection>
        </div>
      </section>
    </>
  );
}
