import type { Metadata } from "next";
import { MotionSection } from "@/components/ui/MotionWrapper";
import { Truck, Package, RotateCcw, ShieldCheck, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Termini di Spedizione e Consegna — Espressamente",
  description: "Informazioni su spedizioni, consegne, resi e garanzie dei prodotti Espressamente.",
};

const highlights = [
  {
    icon: Truck,
    title: "Consegna gratuita",
    description: "Per ordini superiori a €80 su tutto il territorio nazionale",
  },
  {
    icon: Clock,
    title: "Tempi di consegna",
    description: "2–5 giorni lavorativi dalla conferma dell'ordine",
  },
  {
    icon: RotateCcw,
    title: "Reso entro 14 giorni",
    description: "Diritto di recesso garantito per legge",
  },
  {
    icon: ShieldCheck,
    title: "Garanzia 2 anni",
    description: "Su tutti i prodotti come previsto dal Codice del Consumo",
  },
];

export default function TerminiSpedizioneConsegnaPage() {
  return (
    <>
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Spedizioni e Consegne
          </h1>
          <p className="mt-4 text-brand-200 text-lg">
            Tutto quello che devi sapere sui tuoi ordini
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-brand-50 border-b border-brand-100 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-800 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-brand-900 text-sm">{item.title}</p>
                  <p className="text-brand-600 text-xs mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <MotionSection>
          <div className="prose prose-stone max-w-none space-y-10 text-brand-800">

            {/* 1. Modalità d'acquisto */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                1. Modalità d'acquisto e ordini
              </h2>
              <p>
                Espressamente offre i propri prodotti sia tramite i <strong>punti vendita fisici</strong>
                (Formia e Minturno) che su richiesta diretta via email o telefono. Per ordini,
                preventivi personalizzati o informazioni contattaci:
              </p>
              <ul className="mt-3 space-y-2 list-none pl-0">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <span><strong>Formia:</strong> Via Rubino 32, 04023 — Tel. 0771 010221</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <span><strong>Minturno:</strong> Via Luigi Cadorna 52, 04026 — Tel. 0771 65483</span>
                </li>
              </ul>
              <p className="mt-3">
                La conferma dell'ordine viene inviata via email. L'ordine si considera accettato
                solo a seguito di conferma scritta da parte di Espressamente.
              </p>
            </section>

            {/* 2. Spedizioni */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                2. Spedizioni
              </h2>

              <h3 className="text-lg font-semibold text-brand-900 mt-4 mb-2">Corriere e tempi</h3>
              <p>Le spedizioni vengono effettuate tramite corriere espresso (GLS, BRT o equivalente).</p>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-brand-50">
                      <th className="text-left p-3 border border-brand-200 font-semibold">Destinazione</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Tempi stimati</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-brand-200">Italia (zone A–B)</td>
                      <td className="p-3 border border-brand-200">2–3 giorni lavorativi</td>
                      <td className="p-3 border border-brand-200">€6,90 (gratuita oltre €80)</td>
                    </tr>
                    <tr className="bg-brand-50/30">
                      <td className="p-3 border border-brand-200">Italia (isole e zone disagiate)</td>
                      <td className="p-3 border border-brand-200">3–5 giorni lavorativi</td>
                      <td className="p-3 border border-brand-200">€9,90</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-brand-200">Ritiro in negozio</td>
                      <td className="p-3 border border-brand-200">Disponibile entro 24h dalla conferma</td>
                      <td className="p-3 border border-brand-200">Gratuito</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-brand-600 bg-brand-50 p-4 rounded-lg border border-brand-200">
                ℹ️ I tempi di consegna sono indicativi e si riferiscono ai giorni lavorativi successivi
                alla <strong>spedizione</strong> (non dall'ordine). In periodi di alta stagione o festività
                potrebbero verificarsi ritardi da parte del corriere.
              </p>

              <h3 className="text-lg font-semibold text-brand-900 mt-6 mb-2">Tracciamento</h3>
              <p>
                Al momento della spedizione riceverai via email il codice di tracciamento per seguire
                la consegna in tempo reale sul sito del corriere.
              </p>

              <h3 className="text-lg font-semibold text-brand-900 mt-6 mb-2">Mancata consegna</h3>
              <p>
                In caso di assenza al momento della consegna, il corriere lascerà un avviso e effettuerà
                un secondo tentativo il giorno lavorativo successivo. Dopo il secondo tentativo fallito,
                il pacco sarà trattenuto al deposito per 5 giorni lavorativi prima di essere restituito
                al mittente. In tal caso, i costi di rispedizione saranno a carico dell'acquirente.
              </p>
            </section>

            {/* 3. Imballaggio */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                3. Imballaggio e verifica alla consegna
              </h2>
              <p>
                Tutti i prodotti vengono imballati con cura per garantire l'integrità durante il trasporto.
              </p>
              <p className="mt-3">
                <strong>Al momento della consegna ti chiediamo di:</strong>
              </p>
              <ol className="mt-2 space-y-2 list-decimal pl-6">
                <li>Verificare l'integrità esterna del pacco prima di firmare la ricevuta</li>
                <li>In caso di imballaggio danneggiato, firmare con <strong>riserva</strong> specificando il danno</li>
                <li>Segnalarci eventuali danni entro 24 ore dalla ricezione via email o telefono</li>
              </ol>
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                ⚠️ Il ritiro senza riserva libera il corriere da responsabilità per danni esterni.
                Segnala sempre danni visibili all'atto della consegna.
              </p>
            </section>

            {/* 4. Diritto di recesso */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                4. Diritto di recesso e resi
              </h2>
              <p>
                Ai sensi dell'art. 52 del D.Lgs. 206/2005 (Codice del Consumo), hai il diritto di
                recedere dal contratto entro <strong>14 giorni</strong> dalla ricezione del prodotto,
                senza dover fornire alcuna motivazione.
              </p>

              <h3 className="text-lg font-semibold text-brand-900 mt-5 mb-2">Come esercitare il recesso</h3>
              <ol className="space-y-2 list-decimal pl-6">
                <li>Invia comunicazione scritta a <a href="mailto:latino.99@virgilio.it" className="text-brand-700 hover:text-brand-900 underline">latino.99@virgilio.it</a> entro 14 giorni dalla consegna</li>
                <li>Indica: numero ordine, prodotto da restituire, motivo (facoltativo)</li>
                <li>Riceverai istruzioni per la restituzione entro 2 giorni lavorativi</li>
                <li>Restituisci il prodotto entro 14 giorni dalla comunicazione del recesso</li>
              </ol>

              <h3 className="text-lg font-semibold text-brand-900 mt-5 mb-2">Condizioni del reso</h3>
              <ul className="space-y-2 list-disc pl-6">
                <li>Il prodotto deve essere integro, non utilizzato e nell'imballaggio originale</li>
                <li>Le spese di restituzione sono a carico del cliente, salvo difetti di fabbrica</li>
                <li>Il rimborso avviene entro 14 giorni dalla ricezione del reso, con lo stesso metodo di pagamento</li>
              </ul>

              <h3 className="text-lg font-semibold text-brand-900 mt-5 mb-2">Esclusioni dal diritto di recesso</h3>
              <ul className="space-y-2 list-disc pl-6">
                <li>Prodotti su misura o personalizzati</li>
                <li>Prodotti sigillati aperti (es. caffè in grani/capsule per ragioni igieniche)</li>
                <li>Prodotti deteriorabili</li>
              </ul>
            </section>

            {/* 5. Garanzia */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                5. Garanzia legale e assistenza
              </h2>
              <p>
                Tutti i prodotti sono coperti dalla <strong>garanzia legale di conformità di 2 anni</strong>
                ai sensi degli artt. 128–135 del Codice del Consumo.
              </p>
              <p className="mt-3">
                Per macchine da caffè e attrezzature offriamo anche il servizio di <strong>assistenza tecnica
                in loco</strong>. Per aprire una richiesta di assistenza visita la pagina{" "}
                <a href="/assistenza" className="text-brand-700 hover:text-brand-900 underline">
                  Assistenza
                </a>.
              </p>
            </section>

            {/* 6. Contatti */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                6. Contatti per ordini e spedizioni
              </h2>
              <ul className="space-y-2 list-none pl-0">
                <li><strong>Email:</strong> <a href="mailto:latino.99@virgilio.it" className="text-brand-700 hover:text-brand-900 underline">latino.99@virgilio.it</a></li>
                <li><strong>Telefono Formia:</strong> <a href="tel:+390771010221" className="text-brand-700 hover:text-brand-900 underline">0771 010221</a></li>
                <li><strong>Telefono Minturno:</strong> <a href="tel:+390771065483" className="text-brand-700 hover:text-brand-900 underline">0771 65483</a></li>
                <li><strong>Orari:</strong> Lun–Ven 9:00–19:00 | Sab 9:00–13:00</li>
              </ul>
              <p className="mt-5 text-sm text-brand-500">
                <strong>Ultimo aggiornamento:</strong> Marzo 2026
              </p>
            </section>

          </div>
        </MotionSection>
      </div>
    </>
  );
}
