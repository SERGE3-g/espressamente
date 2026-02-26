import Link from "next/link";
import { Wrench } from "lucide-react";
import { MotionSection } from "@/components/ui/MotionWrapper";

export function AssistenzaBanner() {
  return (
    <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-20 px-4 sm:px-6">
      <MotionSection>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-brand-400/15 rounded-2xl flex items-center justify-center shrink-0">
              <Wrench className="w-8 h-8 text-brand-400" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
                Assistenza Tecnica
              </h2>
              <p className="text-brand-300 max-w-xl leading-relaxed">
                Riparazione, manutenzione e assistenza su tutte le macchine da caffè.
                Tecnici qualificati, interventi rapidi e ricambi originali.
              </p>
            </div>
          </div>
          <Link
            href="/assistenza"
            className="bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap hover:shadow-lg hover:shadow-brand-400/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Richiedi Assistenza
          </Link>
        </div>
      </MotionSection>
    </section>
  );
}
