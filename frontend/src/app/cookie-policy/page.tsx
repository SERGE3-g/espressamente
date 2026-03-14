import type { Metadata } from "next";
import { MotionSection } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
  title: "Cookie Policy — Espressamente",
  description: "Informativa sull'utilizzo dei cookie sul sito Espressamente.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">Cookie Policy</h1>
          <p className="mt-4 text-brand-200 text-lg">
            Utilizziamo i cookie
          </p>
          <p className="mt-2 text-brand-300 text-sm">
            Ai sensi dell'art. 122 del D.Lgs. 196/2003 e del Provvedimento Garante n. 229/2014
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <MotionSection>
          <div className="prose prose-stone max-w-none space-y-10 text-brand-800">

            {/* Cosa sono i cookie */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                Cosa sono i cookie
              </h2>
              <p>
                I cookie sono piccoli file di testo che i siti web visitati dall'utente inviano al suo
                dispositivo (computer, tablet, smartphone), dove vengono memorizzati per essere poi
                ritrasmessi agli stessi siti alla visita successiva. I cookie permettono al sito di
                funzionare correttamente e di ricordare le preferenze dell'utente.
              </p>
            </section>

            {/* Tipologie di cookie */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                Tipologie di cookie utilizzati
              </h2>

              <h3 className="text-lg font-semibold text-brand-900 mt-5 mb-3">
                🔧 Cookie tecnici (strettamente necessari)
              </h3>
              <p>
                Questi cookie sono indispensabili per il funzionamento del sito e non possono essere
                disattivati. Non richiedono il consenso dell'utente.
              </p>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-brand-50">
                      <th className="text-left p-3 border border-brand-200 font-semibold">Nome</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Finalità</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Durata</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-brand-200 font-mono text-xs">auth_token</td>
                      <td className="p-3 border border-brand-200">Autenticazione area riservata (solo admin)</td>
                      <td className="p-3 border border-brand-200">Sessione</td>
                    </tr>
                    <tr className="bg-brand-50/30">
                      <td className="p-3 border border-brand-200 font-mono text-xs">cookie_consent</td>
                      <td className="p-3 border border-brand-200">Salva la preferenza cookie dell'utente</td>
                      <td className="p-3 border border-brand-200">12 mesi</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-brand-900 mt-8 mb-3">
                📊 Cookie analitici (anonimi)
              </h3>
              <p>
                Utilizziamo cookie analitici in forma aggregata e anonima per comprendere come gli
                utenti interagiscono con il sito (pagine visitate, durata della sessione, provenienza).
                Non è possibile risalire all'identità del singolo utente.
              </p>
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-brand-50">
                      <th className="text-left p-3 border border-brand-200 font-semibold">Servizio</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Finalità</th>
                      <th className="text-left p-3 border border-brand-200 font-semibold">Dati trasferiti</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-brand-200">Statistiche interne anonime</td>
                      <td className="p-3 border border-brand-200">Conteggio visite per pagina</td>
                      <td className="p-3 border border-brand-200">Solo server interno (UE)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-brand-900 mt-8 mb-3">
                🗺️ Cookie di terze parti (Google Maps)
              </h3>
              <p>
                La pagina <strong>Contatti</strong> include mappe incorporate di Google Maps.
                Quando visualizzi quella pagina, Google può impostare cookie propri per funzionalità
                della mappa. Per informazioni sui cookie di Google consulta la{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 hover:text-brand-900 underline"
                >
                  Privacy Policy di Google
                </a>.
              </p>
            </section>

            {/* Come gestire i cookie */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                Come gestire i cookie
              </h2>
              <p>
                Puoi modificare le preferenze sui cookie in qualsiasi momento attraverso le impostazioni
                del tuo browser. Di seguito le istruzioni per i browser più comuni:
              </p>
              <ul className="mt-4 space-y-2 list-disc pl-6">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-900 underline">
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-900 underline">
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-900 underline">
                    Apple Safari
                  </a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-900 underline">
                    Microsoft Edge
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-sm text-brand-600 bg-brand-50 p-4 rounded-lg border border-brand-200">
                ⚠️ Nota: disabilitare i cookie tecnici potrebbe compromettere il corretto funzionamento
                del sito o di alcune sue funzionalità.
              </p>
            </section>

            {/* Consenso */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                Consenso e revoca
              </h2>
              <p>
                Al primo accesso al sito viene mostrato un banner che ti consente di accettare o
                rifiutare i cookie non tecnici. Puoi modificare la tua scelta in qualsiasi momento
                cliccando su "Gestisci cookie" nel footer del sito, oppure cancellando i cookie
                dal tuo browser.
              </p>
            </section>

            {/* Contatti */}
            <section>
              <h2 className="font-heading text-2xl font-bold text-brand-900 mb-4 pb-2 border-b border-brand-200">
                Contatti
              </h2>
              <p>
                Per qualsiasi domanda sui cookie o sulla presente policy scrivici a{" "}
                <a href="mailto:latino.99@virgilio.it" className="text-brand-700 hover:text-brand-900 underline">
                  latino.99@virgilio.it
                </a>.
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
