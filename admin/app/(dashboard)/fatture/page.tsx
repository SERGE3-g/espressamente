"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, InvoiceListItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import { Pagination } from "@/components/shared/Pagination";
import { Plus, Receipt, Search, X, FileDown } from "lucide-react";

const STATUS_FILTERS = [
  { label: "Tutte", value: "" },
  { label: "Bozza", value: "BOZZA" },
  { label: "Inviate", value: "INVIATA" },
  { label: "Pagate", value: "PAGATA" },
  { label: "Scadute", value: "SCADUTA" },
  { label: "Annullate", value: "ANNULLATA" },
];

const STATUS_VARIANT: Record<string, "secondary" | "warning" | "info" | "success" | "destructive"> = {
  BOZZA: "secondary",
  INVIATA: "info",
  PAGATA: "success",
  SCADUTA: "warning",
  ANNULLATA: "destructive",
};

export default function FatturePage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search & date filters
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(() => {
    setLoading(true);
    api.invoices.getAll(page, statusFilter || undefined, pageSize, search || undefined, dateFrom || undefined, dateTo || undefined)
      .then((res) => {
        setInvoices(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(() => toast({ title: "Errore nel caricamento fatture", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, pageSize, statusFilter, search, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  async function handleExportCsv() {
    setExporting(true);
    try {
      const blob = await api.invoices.exportCsv(
        statusFilter || undefined,
        search || undefined,
        dateFrom || undefined,
        dateTo || undefined
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fatture-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "CSV esportato", variant: "success" });
    } catch {
      toast({ title: "Errore nell'export CSV", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Fatture</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestione fatturazione</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv} loading={exporting}>
            <FileDown className="w-4 h-4" />Esporta CSV
          </Button>
          <Button variant="accent" asChild>
            <Link href="/fatture/nuovo"><Plus className="w-4 h-4" />Nuova fattura</Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button key={f.label} onClick={() => { setStatusFilter(f.value); setPage(0); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              statusFilter === f.value
                ? "bg-brand-800 text-white border-brand-800"
                : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
            }`}>{f.label}</button>
        ))}
      </div>

      {/* Search & date filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input
            type="text"
            placeholder="Cerca fattura o cliente..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 h-9 rounded-lg border border-brand-200 bg-white text-sm placeholder:text-brand-400 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(""); setSearch(""); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Da</span>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="h-9 px-3 rounded-lg border border-brand-200 bg-white text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-gold/40" />
          <span className="text-xs text-muted-foreground">A</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="h-9 px-3 rounded-lg border border-brand-200 bg-white text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-gold/40" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(0); }}
              className="text-sm text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : invoices.length === 0 ? (
            <EmptyState icon={Receipt} title="Nessuna fattura" description={search || dateFrom || dateTo ? "Nessun risultato per i filtri selezionati" : "Crea la prima fattura"}
              action={!search && !dateFrom && !dateTo ? <Button variant="accent" asChild><Link href="/fatture/nuovo"><Plus className="w-4 h-4" />Nuova fattura</Link></Button> : undefined} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Numero</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Totale</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/fatture/${inv.id}`} className="text-sm font-medium text-brand-900 hover:text-accent-gold transition-colors font-mono">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {inv.customer ? inv.customer.fullName : "—"}
                      {inv.customer?.companyName && <span className="block text-xs">{inv.customer.companyName}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(inv.issueDate).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-brand-900">{fmt(inv.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[inv.status] || "secondary"}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
      />
    </>
  );
}
