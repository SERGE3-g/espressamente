"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Customer, Product } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Trash2, Package, X } from "lucide-react";

const PAYMENT_METHODS = [
  { value: "", label: "Seleziona..." },
  { value: "CONTANTI", label: "Contanti" },
  { value: "BONIFICO", label: "Bonifico" },
  { value: "CARTA", label: "Carta" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "ALTRO", label: "Altro" },
];

interface InvoiceItemForm {
  productId?: number;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NuovaFatturaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchingCustomer, setSearchingCustomer] = useState(false);

  // Invoice fields
  const [paymentMethod, setPaymentMethod] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(22);
  const [notes, setNotes] = useState("");

  // Items
  const [items, setItems] = useState<InvoiceItemForm[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Products catalog
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearchIndex, setProductSearchIndex] = useState<number | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  useEffect(() => {
    api.products.getAll(0, 200).then((res) => setProducts(res.content)).catch(() => {});
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  async function searchCustomers(q: string) {
    setCustomerSearch(q);
    if (q.length < 2) { setCustomerResults([]); return; }
    setSearchingCustomer(true);
    try {
      const res = await api.customers.getAll(0, q);
      setCustomerResults(res.content);
    } catch { /* ignore */ }
    setSearchingCustomer(false);
  }

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c);
    setCustomerSearch("");
    setCustomerResults([]);
  }

  function updateItem(index: number, field: keyof InvoiceItemForm, value: string | number) {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function selectProductForItem(index: number, product: Product) {
    setItems(items.map((item, i) =>
      i === index
        ? {
            ...item,
            productId: product.id,
            productName: product.name,
            description: product.name + (product.shortDescription ? ` — ${product.shortDescription}` : ""),
            unitPrice: product.price ?? 0,
          }
        : item
    ));
    setProductSearchIndex(null);
    setProductSearchQuery("");
  }

  function clearProductForItem(index: number) {
    setItems(items.map((item, i) =>
      i === index ? { ...item, productId: undefined, productName: undefined } : item
    ));
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * taxRate / 100;
  const total = subtotal + taxAmount;

  const fmt = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  async function handleSave() {
    if (items.some((i) => !i.description.trim())) {
      toast({ title: "Compila la descrizione di tutte le righe", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const invoice = await api.invoices.create({
        customerId: selectedCustomer?.id,
        paymentMethod: paymentMethod || undefined,
        issueDate,
        dueDate: dueDate || undefined,
        taxRate,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          description: i.description.trim(),
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      toast({ title: "Fattura creata", description: invoice.invoiceNumber, variant: "success" });
      router.push(`/fatture/${invoice.id}`);
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore nella creazione", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/fatture" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-700 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />Fatture
          </Link>
          <h1 className="text-2xl font-semibold text-brand-900">Nuova fattura</h1>
        </div>
        <Button variant="accent" onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />Salva bozza
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Righe fattura</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4" />Aggiungi riga</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="space-y-2 p-3 bg-brand-50/50 rounded-lg border border-brand-100">
                    {/* Product selector row */}
                    <div className="flex items-center gap-2">
                      {item.productId ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Package className="w-4 h-4 text-brand-500 shrink-0" />
                          <span className="text-xs font-medium text-brand-700 truncate">{item.productName}</span>
                          <button onClick={() => clearProductForItem(i)} className="text-brand-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative flex-1">
                          <button
                            onClick={() => { setProductSearchIndex(productSearchIndex === i ? null : i); setProductSearchQuery(""); }}
                            className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-700 transition-colors"
                          >
                            <Package className="w-3 h-3" />Collega prodotto
                          </button>
                          {productSearchIndex === i && (
                            <div className="absolute z-20 top-6 left-0 w-72 bg-white border border-brand-200 rounded-lg shadow-lg">
                              <div className="p-2 border-b border-brand-100">
                                <Input
                                  placeholder="Cerca prodotto..."
                                  value={productSearchQuery}
                                  onChange={(e) => setProductSearchQuery(e.target.value)}
                                  autoFocus
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                  <p className="p-3 text-xs text-muted-foreground">Nessun prodotto trovato</p>
                                ) : (
                                  filteredProducts.slice(0, 10).map((p) => (
                                    <button
                                      key={p.id}
                                      className="w-full text-left px-3 py-2 hover:bg-brand-50 transition-colors"
                                      onClick={() => selectProductForItem(i, p)}
                                    >
                                      <p className="text-sm font-medium text-brand-900">{p.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {p.productType} {p.price != null ? `— ${fmt(p.price)}` : ""}
                                      </p>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description + quantity + price row */}
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <Input placeholder="Descrizione" value={item.description}
                          onChange={(e) => updateItem(i, "description", e.target.value)} />
                      </div>
                      <div className="w-20">
                        <Input type="number" min={1} placeholder="Qtà" value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
                      </div>
                      <div className="w-28">
                        <Input type="number" min={0} step="0.01" placeholder="Prezzo" value={item.unitPrice}
                          onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="w-24 text-right pt-2 text-sm font-medium text-brand-900">
                        {fmt(item.quantity * item.unitPrice)}
                      </div>
                      <button onClick={() => removeItem(i)} disabled={items.length <= 1}
                        className="pt-2 text-brand-400 hover:text-red-500 transition-colors disabled:opacity-30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-brand-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Imponibile</span>
                  <span className="font-medium">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA ({taxRate}%)</span>
                  <span className="font-medium">{fmt(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-brand-900 pt-1 border-t border-brand-100">
                  <span>Totale</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Note</CardTitle></CardHeader>
            <CardContent>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Note sulla fattura..."
                className="flex w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold" />
            </CardContent>
          </Card>
        </div>

        {/* Right column — Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="p-3 bg-brand-50 rounded-lg">
                  <p className="text-sm font-medium text-brand-900">{selectedCustomer.fullName}</p>
                  {selectedCustomer.companyName && <p className="text-xs text-muted-foreground">{selectedCustomer.companyName}</p>}
                  <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  <button onClick={() => setSelectedCustomer(null)} className="text-xs text-red-500 hover:text-red-700 mt-1">
                    Rimuovi
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input placeholder="Cerca cliente..." value={customerSearch}
                    onChange={(e) => searchCustomers(e.target.value)} />
                  {customerResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-brand-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {customerResults.map((c) => (
                        <button key={c.id} onClick={() => selectCustomer(c)}
                          className="w-full text-left px-3 py-2 hover:bg-brand-50 transition-colors">
                          <p className="text-sm font-medium text-brand-900">{c.fullName}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchingCustomer && <p className="text-xs text-muted-foreground mt-1">Ricerca...</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Dettagli</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Data emissione</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Data scadenza</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Metodo di pagamento</Label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-brand-200 bg-white px-3 text-sm">
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Aliquota IVA (%)</Label>
                <Input type="number" min={0} max={100} value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
