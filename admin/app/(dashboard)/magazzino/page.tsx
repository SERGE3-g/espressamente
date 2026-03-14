"use client";

import { useEffect, useState, useCallback } from "react";
import { api, WarehouseStockItem, WarehouseMovement, Product, ImportResult } from "@/lib/api";
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
import { Package, AlertTriangle, ArrowUpDown, Plus, Search, X, Upload, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";

const MOVEMENT_TYPES = [
  { value: "CARICO", label: "Carico", color: "bg-green-100 text-green-800" },
  { value: "SCARICO", label: "Scarico", color: "bg-red-100 text-red-800" },
  { value: "VENDITA", label: "Vendita", color: "bg-blue-100 text-blue-800" },
  { value: "RESO", label: "Reso", color: "bg-yellow-100 text-yellow-800" },
  { value: "RETTIFICA", label: "Rettifica", color: "bg-gray-100 text-gray-800" },
];

function movementBadge(type: string) {
  const mt = MOVEMENT_TYPES.find((m) => m.value === type);
  return mt ? <Badge className={mt.color}>{mt.label}</Badge> : <Badge>{type}</Badge>;
}

type Tab = "stock" | "movements" | "low-stock" | "import";

export default function MagazzinoPage() {
  const [tab, setTab] = useState<Tab>("stock");
  const [stock, setStock] = useState<WarehouseStockItem[]>([]);
  const [lowStock, setLowStock] = useState<WarehouseStockItem[]>([]);
  const [movements, setMovements] = useState<WarehouseMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Movements pagination
  const [movPage, setMovPage] = useState(0);
  const [movTotalPages, setMovTotalPages] = useState(0);
  const [movTotalElements, setMovTotalElements] = useState(0);
  const [movPageSize, setMovPageSize] = useState(20);

  // Adjust dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    productId: 0,
    movementType: "CARICO",
    quantity: 1,
    reorderPoint: undefined as number | undefined,
    notes: "",
  });

  // Product search for dialog
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState("");

  // Import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleImportFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx"].includes(ext)) {
      toast({ title: "Formato non supportato", description: "Usa file .csv o .xlsx", variant: "destructive" });
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const result = await api.warehouse.importFile(file);
      setImportResult(result);
      toast({ title: "Import completato", description: `${result.created} creati, ${result.updated} aggiornati` });
      loadAll();
    } catch (e) {
      toast({ title: "Errore import", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const loadStock = useCallback(async () => {
    try {
      const data = await api.warehouse.getStock();
      setStock(data);
    } catch {
      toast({ title: "Errore", description: "Impossibile caricare giacenze", variant: "destructive" });
    }
  }, []);

  const loadLowStock = useCallback(async () => {
    try {
      const data = await api.warehouse.getLowStock();
      setLowStock(data);
    } catch {
      toast({ title: "Errore", description: "Impossibile caricare scorte basse", variant: "destructive" });
    }
  }, []);

  const loadMovements = useCallback(async (page = 0, size = movPageSize) => {
    try {
      const data = await api.warehouse.getMovements(page, size);
      setMovements(data.content);
      setMovTotalPages(data.totalPages);
      setMovTotalElements(data.totalElements);
      setMovPage(data.number);
    } catch {
      toast({ title: "Errore", description: "Impossibile caricare movimenti", variant: "destructive" });
    }
  }, [movPageSize]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStock(), loadLowStock(), loadMovements()]);
    setLoading(false);
  }, [loadStock, loadLowStock, loadMovements]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Load products for the adjust dialog
  const loadProducts = useCallback(async () => {
    try {
      const res = await api.products.getAll(0, 200);
      setProducts(res.content);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredStock = stock.filter((s) =>
    !searchQuery || s.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjust = async () => {
    if (!form.productId) {
      toast({ title: "Errore", description: "Seleziona un prodotto", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api.warehouse.adjustStock({
        productId: form.productId,
        movementType: form.movementType,
        quantity: form.quantity,
        reorderPoint: form.reorderPoint,
        notes: form.notes || undefined,
      });
      toast({ title: "Successo", description: "Giacenza aggiornata" });
      setDialogOpen(false);
      resetForm();
      loadAll();
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore aggiornamento", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ productId: 0, movementType: "CARICO", quantity: 1, reorderPoint: undefined, notes: "" });
    setSelectedProductName("");
    setProductSearch("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalItems = stock.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockCount = lowStock.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Magazzino</h1>
          <p className="text-sm text-muted-foreground">Gestione giacenze e movimenti</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Movimento
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prodotti a magazzino</p>
                <p className="text-2xl font-bold">{stock.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ArrowUpDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pezzi totali</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${lowStockCount > 0 ? "bg-red-100" : "bg-green-100"}`}>
                <AlertTriangle className={`w-5 h-5 ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scorte basse</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {([
          { key: "stock" as Tab, label: "Giacenze" },
          { key: "movements" as Tab, label: "Movimenti" },
          { key: "low-stock" as Tab, label: `Scorte basse (${lowStockCount})` },
          { key: "import" as Tab, label: "Import" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stock tab */}
      {tab === "stock" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca prodotto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {filteredStock.length === 0 ? (
            <EmptyState icon={Package} title="Nessuna giacenza" description="Registra il primo movimento per iniziare" />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Codice</th>
                    <th className="text-left p-3 font-medium">Prodotto</th>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-right p-3 font-medium">Giacenza</th>
                    <th className="text-right p-3 font-medium">Soglia</th>
                    <th className="text-center p-3 font-medium">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStock.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{s.productSku || "—"}</td>
                      <td className="p-3 font-medium">{s.productName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{s.productType}</Badge>
                      </td>
                      <td className="p-3 text-right font-mono">{s.quantity}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{s.reorderPoint}</td>
                      <td className="p-3 text-center">
                        {s.lowStock ? (
                          <Badge className="bg-red-100 text-red-800">Bassa</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Movements tab */}
      {tab === "movements" && (
        <div className="space-y-4">
          {movements.length === 0 ? (
            <EmptyState icon={ArrowUpDown} title="Nessun movimento" description="I movimenti appariranno qui" />
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-left p-3 font-medium">Prodotto</th>
                      <th className="text-center p-3 font-medium">Tipo</th>
                      <th className="text-right p-3 font-medium">Qtà</th>
                      <th className="text-right p-3 font-medium">Prima</th>
                      <th className="text-right p-3 font-medium">Dopo</th>
                      <th className="text-left p-3 font-medium">Note</th>
                      <th className="text-left p-3 font-medium">Utente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </td>
                        <td className="p-3 font-medium">{m.productName}</td>
                        <td className="p-3 text-center">{movementBadge(m.movementType)}</td>
                        <td className="p-3 text-right font-mono">{m.quantity}</td>
                        <td className="p-3 text-right font-mono text-muted-foreground">{m.previousStock}</td>
                        <td className="p-3 text-right font-mono">{m.newStock}</td>
                        <td className="p-3 text-muted-foreground truncate max-w-[200px]">{m.notes || "—"}</td>
                        <td className="p-3 text-muted-foreground">{m.adminUsername || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={movPage}
                totalPages={movTotalPages}
                pageSize={movPageSize}
                totalElements={movTotalElements}
                onPageChange={(p) => loadMovements(p)}
                onPageSizeChange={(s) => { setMovPageSize(s); loadMovements(0, s); }}
              />
            </>
          )}
        </div>
      )}

      {/* Low stock tab */}
      {tab === "low-stock" && (
        <div className="space-y-4">
          {lowStock.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="Nessuna scorta bassa" description="Tutte le giacenze sono sopra soglia" />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Prodotto</th>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-right p-3 font-medium">Giacenza</th>
                    <th className="text-right p-3 font-medium">Soglia</th>
                    <th className="text-center p-3 font-medium">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowStock.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">{s.productName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{s.productType}</Badge>
                      </td>
                      <td className="p-3 text-right font-mono text-red-600 font-bold">{s.quantity}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{s.reorderPoint}</td>
                      <td className="p-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            resetForm();
                            setForm((f) => ({ ...f, productId: s.productId }));
                            setSelectedProductName(s.productName);
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Carica
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Import tab */}
      {tab === "import" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleImportFile(file);
                }}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  {importing ? "Importazione in corso..." : "Trascina qui il file o clicca per selezionare"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">Formati supportati: CSV (.csv), Excel (.xlsx)</p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  id="import-file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                    e.target.value = "";
                  }}
                  disabled={importing}
                />
                <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()} disabled={importing}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {importing ? "Importando..." : "Scegli file"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Format guide */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold mb-3">Formato richiesto</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Il file deve avere una riga di intestazione. Le colonne riconosciute sono:
              </p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 font-medium">Colonna</th>
                      <th className="text-left p-2 font-medium">Obbligatorio</th>
                      <th className="text-left p-2 font-medium">Descrizione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr><td className="p-2 font-mono">sku</td><td className="p-2">No</td><td className="p-2 text-muted-foreground">Codice prodotto (univoco)</td></tr>
                    <tr><td className="p-2 font-mono">name</td><td className="p-2">Sì*</td><td className="p-2 text-muted-foreground">Nome prodotto</td></tr>
                    <tr><td className="p-2 font-mono">type</td><td className="p-2">No</td><td className="p-2 text-muted-foreground">CAFFE, MACCHINA, ACCESSORIO (default: CAFFE)</td></tr>
                    <tr><td className="p-2 font-mono">price</td><td className="p-2">No</td><td className="p-2 text-muted-foreground">Prezzo unitario (es. 12.50)</td></tr>
                    <tr><td className="p-2 font-mono">quantity</td><td className="p-2">No</td><td className="p-2 text-muted-foreground">Quantità da caricare a magazzino</td></tr>
                    <tr><td className="p-2 font-mono">reorderPoint</td><td className="p-2">No</td><td className="p-2 text-muted-foreground">Soglia riordino (default: 5)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">* Almeno una tra <code className="bg-muted px-1 rounded">sku</code> e <code className="bg-muted px-1 rounded">name</code> è richiesta. Le intestazioni in italiano (codice, nome, tipo, prezzo, quantità, giacenza, soglia) sono accettate.</p>
            </CardContent>
          </Card>

          {/* Import results */}
          {importResult && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-3">Risultato importazione</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">{importResult.totalRows}</p>
                    <p className="text-xs text-muted-foreground">Righe totali</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">{importResult.created}</p>
                    <p className="text-xs text-green-600">Creati</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">{importResult.updated}</p>
                    <p className="text-xs text-blue-600">Aggiornati</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">{importResult.skipped}</p>
                    <p className="text-xs text-red-600">Saltati</p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-700 mb-2">Errori ({importResult.errors.length}):</p>
                    <ul className="space-y-1">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                          <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {importResult.errors.length === 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Import completato senza errori</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Adjust stock dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo movimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Product selector */}
            <div className="space-y-2">
              <Label>Prodotto *</Label>
              {selectedProductName ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium flex-1 border rounded-md px-3 py-2">{selectedProductName}</span>
                  <Button size="sm" variant="ghost" onClick={() => { setForm((f) => ({ ...f, productId: 0 })); setSelectedProductName(""); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Cerca prodotto..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                    onFocus={() => setShowProductDropdown(true)}
                  />
                  {showProductDropdown && productSearch && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground">Nessun prodotto trovato</div>
                      ) : (
                        filteredProducts.slice(0, 10).map((p) => (
                          <button
                            key={p.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50"
                            onClick={() => {
                              setForm((f) => ({ ...f, productId: p.id }));
                              setSelectedProductName(p.name);
                              setProductSearch("");
                              setShowProductDropdown(false);
                            }}
                          >
                            {p.name} <span className="text-muted-foreground">({p.productType})</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Movement type */}
            <div className="space-y-2">
              <Label>Tipo movimento *</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.movementType}
                onChange={(e) => setForm((f) => ({ ...f, movementType: e.target.value }))}
              >
                {MOVEMENT_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value}>{mt.label}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Quantità *</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>

            {/* Reorder point */}
            <div className="space-y-2">
              <Label>Soglia riordino</Label>
              <Input
                type="number"
                min={0}
                placeholder="Default: 5"
                value={form.reorderPoint ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, reorderPoint: e.target.value ? parseInt(e.target.value) : undefined }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Note</Label>
              <Input
                placeholder="Note opzionali..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleAdjust} disabled={saving || !form.productId}>
              {saving ? "Salvataggio..." : "Registra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
