"use client";

import { useEffect, useState } from "react";
import { api, ProfitAndLoss } from "@/lib/api";
import { Download } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  VENDITA: "Vendita",
  COMODATO: "Comodato",
  ASSISTENZA: "Assistenza",
  FORNITORE: "Fornitore",
  AFFITTO: "Affitto",
  UTENZE: "Utenze",
  PERSONALE: "Personale",
  MARKETING: "Marketing",
  LOGISTICA: "Logistica",
  ALTRO: "Altro",
};

function fmt(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
}

export default function ProfitLossReportPage() {
  const today = new Date();
  const yearStart = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().split("T")[0];

  const [from, setFrom] = useState(yearStart);
  const [to, setTo] = useState(todayStr);
  const [data, setData] = useState<ProfitAndLoss | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.accounting.getProfitLoss(from, to).then(setData).finally(() => setLoading(false));
  }, [from, to]);

  function exportCsv() {
    if (!data) return;
    const BOM = "\uFEFF";
    const lines = ["Categoria,Entrate,Uscite,Netto"];
    for (const cat of data.categories) {
      lines.push(`${CATEGORY_LABELS[cat.category] || cat.category},${cat.entrate},${cat.uscite},${cat.netto}`);
    }
    lines.push(`TOTALE,${data.totalEntrate},${data.totalUscite},${data.netResult}`);
    const blob = new Blob([BOM + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-pl-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Report Profitti & Perdite</h1>
        <button
          onClick={exportCsv}
          disabled={!data || data.categories.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Esporta CSV
        </button>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Da</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">A</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      ) : !data || data.categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nessun dato per il periodo selezionato.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Categoria</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Entrate</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Uscite</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Netto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.categories.map((cat) => (
                <tr key={cat.category} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{CATEGORY_LABELS[cat.category] || cat.category}</td>
                  <td className="px-4 py-3 text-right text-green-600">{fmt(cat.entrate)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{fmt(cat.uscite)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${cat.netto >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {fmt(cat.netto)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/70 font-bold">
                <td className="px-4 py-3">TOTALE</td>
                <td className="px-4 py-3 text-right text-green-700">{fmt(data.totalEntrate)}</td>
                <td className="px-4 py-3 text-right text-red-700">{fmt(data.totalUscite)}</td>
                <td className={`px-4 py-3 text-right ${data.netResult >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {fmt(data.netResult)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {data && (
        <p className="text-xs text-muted-foreground">
          Periodo: {data.periodFrom} — {data.periodTo}
        </p>
      )}
    </div>
  );
}
