import type { Metadata } from "next";
import { api } from "@/lib/api";
import { MotionSection } from "@/components/ui/MotionWrapper";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Chi Siamo — Espressamente",
  description: "Scopri la storia e i valori di Espressamente.",
};

const fallbackContent = `
  <p>Espressamente nasce dalla passione per il caffè di qualità e dalla volontà di portare
  l'eccellenza italiana nelle tazze di ogni giorno.</p>
  <p>Da anni selezioniamo le migliori miscele, curiamo la formazione dei nostri baristi e
  offriamo un servizio di assistenza tecnica dedicato, perché crediamo che una buona tazza
  di caffè inizi dalla qualità della macchina e finisca nella cura del dettaglio.</p>
  <p>Il nostro team è composto da professionisti appassionati, sempre pronti ad accompagnarti
  nella scelta del prodotto giusto per le tue esigenze.</p>
`;

export default async function ChiSiamoPage() {
  let pageContent: { title: string; content: string } | null = null;

  try {
    pageContent = await api.pages.getBySlug("chi-siamo");
  } catch {
    // fallback al contenuto statico
  }

  const title = pageContent?.title || "Chi Siamo";
  const content = pageContent?.content || fallbackContent;

  return (
    <>
      {/* Page hero */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">{title}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <MotionSection>
          <div
            className="prose-brand"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </MotionSection>
      </div>
    </>
  );
}
