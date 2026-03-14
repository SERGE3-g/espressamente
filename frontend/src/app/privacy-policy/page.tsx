import type { Metadata } from "next";
import { MotionSection } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
  title: "Privacy Policy — Espressamente",
  description: "Informativa sul trattamento dei dati personali ai sensi del GDPR 2016/679.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-brand-200 text-lg">
            Informativa sul trattamento dei dati personali
          </p>
          <p className="mt-2 text-brand-300 text-sm">
            Ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR)
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <MotionSection>
          <div className="prose prose-stone max-w-none space-y-10 text-brand-800">

            {/* 1. Titolare */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                1. Titolare del trattamento
              </h2>
              <p>
                Il Titolare del trattamento dei dati personali è <strong>Espressamente Coffee</strong>,
                con sede in Via Rubino 32, 04023 Formia (LT) — P. IVA 01896400593.
              </p>
              <p className="mt-3">
                Per qualsiasi comunicazione relativa alla privacy puoi contattarci a:
              </p>
              <ul className="mt-2 space-y-1 list-none pl-0">
                <li><strong>Email:</strong> <a href="mailto:latino.99@virgilio.it" className="text-brand-700 hover:text-brand-900">latino.99@virgilio.it</a></li>
                <li><strong>Telefono:</strong> <a href="tel:+390771010221" className="text-brand-700 hover:text-brand-900">0771 010221</a></li>
                <li><strong>Indirizzo:</strong> Via Rubino 32, 04023 Formia (LT)</li>
              </ul>
            </section>

            {/* 2. Dati raccolti */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                2. Dati personali raccolti
              </h2>
              <p>In base all'utilizzo del sito, raccogliamo le seguenti categorie di dati:</p>

              <h3 className="text-lg font-semibold text-brand-900 mt-5 mb-2">a) Dati di navigazione</h3>
              <p>
                I sistemi informatici acquisiscono automaticamente alcuni dati la cui trasmissione è implicita
                nell'uso dei protocolli Internet: indirizzo IP, tipo di browser, sistema operativo, pagine visitate,
                data e ora di accesso. Questi dati sono utilizzati esclusivamente per finalità statistiche anonime.
              </p>

              <h3 className="text-lg font-semibold text-brand-900 mt-5 mb-2">b) Dati forniti volontariamente</h3>
              <p>Tramite i moduli presenti sul sito raccogliamo:</p>
              <ul className="mt-2 space-y-1 list-disc pl-6">
                <li><strong>Form di contatto:</strong> nome e cognome, email, telefono, messaggio</li>
                <li><strong>Richiesta assistenza:</strong> nome e cognome, email, telefono, dati della macchina, descrizione del problema</li>
                <li><strong>Richiesta comodato:</strong> nome e cognome, email, telefono, ragione sociale (opzionale), indirizzo, città, macchina richiesta</li>
              </ul>
            </section>

            {/* 3. Finalità e basi giuridiche */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                3. Finalità e basi giuridiche del trattamento
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-3">
                  <thead>
                    <tr className="bg-brand-50">
                      <th className="text-left p-3 border border-brand-200 font-semibold">Finalità</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Base giuridica</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Conservazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-brand-200">Gestione richieste di contatto e preventivo</td>
                      <td className="p-3 border border-brand-200">Consenso (art. 6 §1 lett. a)</td>
                      <td className="p-3 border border-brand-200">24 mesi</td>
                    </tr>
                    <tr className="bg-brand-50/30">
                      <td className="p-3 border border-brand-200">Gestione richieste di assistenza tecnica</td>
                      <td className="p-3 border border-brand-200">Esecuzione contratto (art. 6 §1 lett. b)</td>
                      <td className="p-3 border border-brand-200">36 mesi</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-brand-200">Gestione richieste comodato d'uso</td>
                      <td className="p-3 border border-brand-200">Esecuzione contratto (art. 6 §1 lett. b)</td>
                      <td className="p-3 border border-brand-200">Per tutta la durata del contratto + 36 mesi</td>
                    </tr>
                    <tr className="bg-brand-50/30">
                      <td className="p-3 border border-brand-200">Adempimenti fiscali e contabili</td>
                      <td className="p-3 border border-brand-200">Obbligo legale (art. 6 §1 lett. c)</td>
                      <td className="p-3 border border-brand-200">10 anni (normativa fiscale)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-brand-200">Statistiche di navigazione anonime</td>
                      <td className="p-3 border border-brand-200">Legittimo interesse (art. 6 §1 lett. f)</td>
                      <td className="p-3 border border-brand-200">12 mesi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. Cookie */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                4. Cookie
              </h2>
              <p>
                Il sito utilizza cookie tecnici necessari al funzionamento e cookie analitici in forma anonima.
                Per informazioni dettagliate consulta la nostra{" "}
                <a href="/cookie-policy" className="text-brand-700 hover:text-brand-900 underline">
                  Cookie Policy
                </a>.
              </p>
            </section>

            {/* 5. Comunicazione dati */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                5. Comunicazione e diffusione dei dati
              </h2>
              <p>I tuoi dati personali non sono venduti né ceduti a terzi. Possono essere comunicati a:</p>
              <ul className="mt-3 space-y-2 list-disc pl-6">
                <li><strong>Fornitori di servizi tecnologici</strong> (hosting, email SMTP) nella qualità di Responsabili del trattamento ex art. 28 GDPR</li>
                <li><strong>Autorità competenti</strong> nei casi previsti dalla legge</li>
              </ul>
              <p className="mt-3">
                I dati non sono trasferiti fuori dall'Unione Europea, eccetto per i servizi email (Google Gmail)
                che opera in conformità alle Clausole Contrattuali Standard della Commissione Europea.
              </p>
            </section>

            {/* 6. Diritti */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                6. I tuoi diritti
              </h2>
              <p>Ai sensi degli artt. 15-22 del GDPR hai il diritto di:</p>
              <ul className="mt-3 space-y-2 list-disc pl-6">
                <li><strong>Accesso</strong> — ottenere conferma che i tuoi dati siano trattati e riceverne copia</li>
                <li><strong>Rettifica</strong> — correggere dati inesatti o incompleti</li>
                <li><strong>Cancellazione</strong> — chiedere la cancellazione dei tuoi dati ("diritto all'oblio")</li>
                <li><strong>Limitazione</strong> — limitare il trattamento in determinati casi</li>
                <li><strong>Portabilità</strong> — ricevere i tuoi dati in formato strutturato e leggibile</li>
                <li><strong>Opposizione</strong> — opporsi al trattamento basato su legittimo interesse</li>
                <li><strong>Revoca del consenso</strong> — in qualsiasi momento, senza pregiudizio per il trattamento precedente</li>
              </ul>
              <p className="mt-4">
                Per esercitare i tuoi diritti scrivi a{" "}
                <a href="mailto:latino.99@virgilio.it" className="text-brand-700 hover:text-brand-900 underline">
                  latino.99@virgilio.it
                </a>.
                Risponderemo entro 30 giorni. Hai inoltre il diritto di proporre reclamo al{" "}
                <a
                  href="https://www.garanteprivacy.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 hover:text-brand-900 underline"
                >
                  Garante per la Protezione dei Dati Personali
                </a>.
              </p>
            </section>

            {/* 7. Sicurezza */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                7. Sicurezza dei dati
              </h2>
              <p>
                Adottiamo misure tecniche e organizzative adeguate a proteggere i dati personali da accessi non
                autorizzati, perdita, distruzione o divulgazione accidentale. Tra le misure implementate:
              </p>
              <ul className="mt-3 space-y-2 list-disc pl-6">
                <li>Comunicazioni cifrate tramite protocollo HTTPS/TLS</li>
                <li>Cifratura dei dati sensibili nel database</li>
                <li>Accesso ai dati limitato al personale autorizzato con autenticazione sicura</li>
                <li>Log degli accessi alle informazioni personali</li>
              </ul>
            </section>

            {/* 8. Aggiornamenti */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                8. Aggiornamenti alla presente informativa
              </h2>
              <p>
                La presente informativa può essere aggiornata. La versione più recente è sempre disponibile
                su questa pagina. In caso di modifiche sostanziali, ti informeremo tramite un avviso sul sito.
              </p>
              <p className="mt-3 text-sm text-brand-500">
                <strong>Ultimo aggiornamento:</strong> Marzo 2026
              </p>
            </section>

          </div>
        </MotionSection>
      </div>
    </>
  );
}
