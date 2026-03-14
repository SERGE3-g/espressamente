"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api, AccountingEntry, AccountingSummary, Customer, InvoiceListItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Pagination } from "@/components/shared/Pagination";
import { Plus, TrendingUp, TrendingDown, Calculator, Trash2, Pencil, Search, X, FileDown } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const TYPE_FILTERS = [
  { label: "Tutte", value: "" },
  { label: "Entrate", value: "ENTRATA" },
  { label: "Uscite", value: "USCITA" },
];

const CATEGORIES = [
  "VENDITA", "COMODATO", "ASSISTENZA",
  "FORNITORE", "AFFITTO", "UTENZE", "PERSONALE",
  "MARKETING", "LOGISTICA", "ALTRO",
];

const EMPTY_FORM = {
  type: "ENTRATA", category: "VENDITA", amount: "", description: "",
  date: new Date().toISOString().split("T")[0], notes: "",
  customerId: undefined as number | undefined,
  customerName: "",
  invoiceId: undefined as number | undefined,
  invoiceNumber: "",
};

export default function ContabilitaPage() {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Invoice search
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceResults, setInvoiceResults] = useState<InvoiceListItem[]>([]);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Customer search debounce
  useEffect(() => {
    if (!customerSearch || customerSearch.length < 2) { setCustomerResults([]); return; }
    const timer = setTimeout(() => {
      api.customers.getAll(0, customerSearch, undefined, 5)
        .then((res) => { setCustomerResults(res.content); setShowCustomerDropdown(true); })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Invoice search debounce
  useEffect(() => {
    if (!invoiceSearch || invoiceSearch.length < 2) { setInvoiceResults([]); return; }
    const timer = setTimeout(() => {
      api.invoices.getAll(0, undefined, 5, invoiceSearch)
        .then((res) => { setInvoiceResults(res.content); setShowInvoiceDropdown(true); })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [invoiceSearch]);

  const loadEntries = useCallback(() => {
    setLoading(true);
    api.accounting.getAll(page, typeFilter || undefined, pageSize, categoryFilter || undefined, search || undefined, dateFrom || undefined, dateTo || undefined)
      .then((res) => {
        setEntries(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(() => toast({ title: "Errore nel caricamento", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, pageSize, typeFilter, categoryFilter, search, dateFrom, dateTo]);

  const loadSummary = useCallback(() => {
    api.accounting.getSummary(dateFrom || undefined, dateTo || undefined, typeFilter || undefined, categoryFilter || undefined)
      .then(setSummary).catch(() => {});
  }, [dateFrom, dateTo, typeFilter, categoryFilter]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  const fmt = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  function openCreate() {
    setEditingEntry(null);
    setForm({ ...EMPTY_FORM });
    setCustomerSearch("");
    setInvoiceSearch("");
    setDialogOpen(true);
  }

  function openEdit(entry: AccountingEntry) {
    setEditingEntry(entry);
    setForm({
      type: entry.type,
      category: entry.category,
      amount: String(entry.amount),
      description: entry.description,
      date: entry.date,
      notes: entry.notes || "",
      customerId: entry.customerId ?? undefined,
      customerName: entry.customerName || "",
      invoiceId: entry.invoiceId ?? undefined,
      invoiceNumber: entry.invoiceNumber || "",
    });
    setCustomerSearch("");
    setInvoiceSearch("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.description.trim() || !form.amount) return;
    setSaving(true);
    try {
      const data = {
        type: form.type,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        date: form.date || undefined,
        notes: form.notes.trim() || undefined,
        customerId: form.customerId,
        invoiceId: form.invoiceId,
      };
      if (editingEntry) {
        await api.accounting.update(editingEntry.id, data);
        toast({ title: "Registrazione aggiornata", variant: "success" });
      } else {
        await api.accounting.create(data);
        toast({ title: "Registrazione aggiunta", variant: "success" });
      }
      setDialogOpen(false);
      loadEntries();
      loadSummary();
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Eliminare questa registrazione?")) return;
    try {
      await api.accounting.delete(id);
      loadEntries();
      loadSummary();
      toast({ title: "Registrazione eliminata", variant: "success" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      const blob = await api.accounting.exportCsv(
        typeFilter || undefined, categoryFilter || undefined,
        search || undefined, dateFrom || undefined, dateTo || undefined
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contabilita-export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "CSV esportato", variant: "success" });
    } catch {
      toast({ title: "Errore nell'export CSV", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  // ── Chart data ──
  const monthlyData = useMemo(() => {
    const months: Record<string, { entrate: number; uscite: number }> = {};
    entries.forEach((e) => {
      const m = e.date.substring(0, 7); // YYYY-MM
      if (!months[m]) months[m] = { entrate: 0, uscite: 0 };
      if (e.type === "ENTRATA") months[m].entrate += e.amount;
      else months[m].uscite += e.amount;
    });
    const labels = Object.keys(months).sort();
    return {
      labels: labels.map((l) => { const [y, m] = l.split("-"); return `${m}/${y.slice(2)}`; }),
      datasets: [
        { label: "Entrate", data: labels.map((l) => months[l].entrate), backgroundColor: "rgba(16, 185, 129, 0.7)" },
        { label: "Uscite", data: labels.map((l) => months[l].uscite), backgroundColor: "rgba(239, 68, 68, 0.7)" },
      ],
    };
  }, [entries]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    entries.forEach((e) => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    const labels = Object.keys(cats);
    const colors = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];
    return {
      labels,
      datasets: [{
        data: labels.map((l) => cats[l]),
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
      }],
    };
  }, [entries]);

  const hasFilters = search || dateFrom || dateTo || categoryFilter;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Contabilità</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro entrate e uscite</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv} loading={exporting}>
            <FileDown className="w-4 h-4" />Esporta CSV
          </Button>
          <Button variant="accent" onClick={openCreate}>
            <Plus className="w-4 h-4" />Nuova registrazione
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
            <div>
              {summary ? <p className="text-xl font-bold text-emerald-700">{fmt(summary.totalEntrate)}</p> : <Skeleton className="h-7 w-24" />}
              <p className="text-xs text-muted-foreground">Entrate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><TrendingDown className="w-5 h-5 text-red-600" /></div>
            <div>
              {summary ? <p className="text-xl font-bold text-red-700">{fmt(summary.totalUscite)}</p> : <Skeleton className="h-7 w-24" />}
              <p className="text-xs text-muted-foreground">Uscite</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-100"><Calculator className="w-5 h-5 text-brand-600" /></div>
            <div>
              {summary ? (
                <p className={`text-xl font-bold ${summary.bilancio >= 0 ? "text-emerald-700" : "text-red-700"}`}>{fmt(summary.bilancio)}</p>
              ) : <Skeleton className="h-7 w-24" />}
              <p className="text-xs text-muted-foreground">Bilancio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-brand-700 mb-3">Entrate vs Uscite per mese</p>
              <div className="h-56">
                <Bar data={monthlyData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-brand-700 mb-3">Ripartizione per categoria</p>
              <div className="h-56 flex items-center justify-center">
                <Pie data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } } }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button key={f.label} onClick={() => { setTypeFilter(f.value); setPage(0); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              typeFilter === f.value ? "bg-brand-800 text-white border-brand-800" : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
            }`}>{f.label}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <input type="text" placeholder="Cerca descrizione, cliente, fattura..."
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 h-9 rounded-lg border border-brand-200 bg-white text-sm placeholder:text-brand-400 focus:outline-none focus:ring-2 focus:ring-accent-gold/40" />
          {searchInput && (
            <button onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          className="h-9 rounded-lg border border-brand-200 bg-white px-3 text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-gold/40">
          <option value="">Tutte le categorie</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Da</span>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="h-9 px-3 rounded-lg border border-brand-200 bg-white text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-gold/40" />
          <span className="text-xs text-muted-foreground">A</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="h-9 px-3 rounded-lg border border-brand-200 bg-white text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-gold/40" />
          {hasFilters && (
            <button onClick={() => { setSearchInput(""); setSearch(""); setCategoryFilter(""); setDateFrom(""); setDateTo(""); setPage(0); }}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
              <X className="w-4 h-4" />Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : entries.length === 0 ? (
            <EmptyState icon={Calculator} title="Nessuna registrazione" description={hasFilters ? "Nessun risultato per i filtri selezionati" : "Aggiungi la prima registrazione contabile"}
              action={!hasFilters ? <Button variant="accent" onClick={openCreate}><Plus className="w-4 h-4" />Nuova registrazione</Button> : undefined} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Categoria</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Descrizione</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Importo</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(e.date).toLocaleDateString("it-IT")}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.type === "ENTRATA" ? "success" : "destructive"}>
                        {e.type === "ENTRATA" ? "Entrata" : "Uscita"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{e.category}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-brand-900">{e.description}</p>
                      {e.invoiceNumber && <p className="text-xs text-muted-foreground">{e.invoiceNumber}</p>}
                      {e.customerName && <p className="text-xs text-muted-foreground">{e.customerName}</p>}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium text-right ${e.type === "ENTRATA" ? "text-emerald-700" : "text-red-700"}`}>
                      {e.type === "ENTRATA" ? "+" : "-"}{fmt(e.amount)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(e)} className="text-brand-400 hover:text-brand-700 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="text-brand-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} pageSize={pageSize} totalElements={totalElements}
        onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(0); }} />

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Modifica registrazione" : "Nuova registrazione"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {["ENTRATA", "USCITA"].map((t) => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    form.type === t
                      ? (t === "ENTRATA" ? "bg-emerald-600 text-white border-emerald-600" : "bg-red-600 text-white border-red-600")
                      : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
                  }`}>{t === "ENTRATA" ? "Entrata" : "Uscita"}</button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-brand-200 bg-white px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Importo *</Label>
              <Input type="number" min={0} step="0.01" placeholder="0.00" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrizione *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrizione della registrazione" />
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>

            {/* Customer selector */}
            <div className="space-y-1.5">
              <Label>Cliente (opzionale)</Label>
              {form.customerId ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-brand-200 bg-brand-50">
                  <span className="text-sm text-brand-900 flex-1">{form.customerName}</span>
                  <button onClick={() => setForm({ ...form, customerId: undefined, customerName: "" })} className="text-brand-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input placeholder="Cerca cliente..." value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onFocus={() => customerResults.length > 0 && setShowCustomerDropdown(true)} />
                  {showCustomerDropdown && customerResults.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-brand-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {customerResults.map((c) => (
                        <button key={c.id} className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors"
                          onClick={() => {
                            setForm({ ...form, customerId: c.id, customerName: c.fullName });
                            setCustomerSearch("");
                            setShowCustomerDropdown(false);
                          }}>
                          <p className="font-medium text-brand-900">{c.fullName}</p>
                          {c.companyName && <p className="text-xs text-muted-foreground">{c.companyName}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Invoice selector */}
            <div className="space-y-1.5">
              <Label>Fattura (opzionale)</Label>
              {form.invoiceId ? (
                <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-brand-200 bg-brand-50">
                  <span className="text-sm text-brand-900 font-mono flex-1">{form.invoiceNumber}</span>
                  <button onClick={() => setForm({ ...form, invoiceId: undefined, invoiceNumber: "" })} className="text-brand-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input placeholder="Cerca fattura..." value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    onFocus={() => invoiceResults.length > 0 && setShowInvoiceDropdown(true)} />
                  {showInvoiceDropdown && invoiceResults.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-brand-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {invoiceResults.map((inv) => (
                        <button key={inv.id} className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors"
                          onClick={() => {
                            setForm({ ...form, invoiceId: inv.id, invoiceNumber: inv.invoiceNumber });
                            setInvoiceSearch("");
                            setShowInvoiceDropdown(false);
                          }}>
                          <p className="font-mono font-medium text-brand-900">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{inv.customer?.fullName} — {fmt(inv.total)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Note</Label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2} placeholder="Note opzionali..."
                className="flex w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button variant="accent" onClick={handleSave} loading={saving}
              disabled={!form.description.trim() || !form.amount}>
              {editingEntry ? "Aggiorna" : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
