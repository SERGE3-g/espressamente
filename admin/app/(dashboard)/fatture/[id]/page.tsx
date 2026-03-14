"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, InvoiceDetail } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send, CreditCard, Ban, Trash2, Download, Mail } from "lucide-react";

const STATUS_VARIANT: Record<string, "secondary" | "warning" | "info" | "success" | "destructive"> = {
  BOZZA: "secondary",
  INVIATA: "info",
  PAGATA: "success",
  SCADUTA: "warning",
  ANNULLATA: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  BOZZA: "Bozza",
  INVIATA: "Inviata",
  PAGATA: "Pagata",
  SCADUTA: "Scaduta",
  ANNULLATA: "Annullata",
};

export default function FatturaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.invoices.getById(id)
      .then(setInvoice)
      .catch(() => toast({ title: "Fattura non trovata", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);

  async function handleStatusChange(status: string) {
    try {
      const updated = await api.invoices.updateStatus(id, status);
      setInvoice(updated);
      toast({ title: `Fattura ${STATUS_LABELS[status]?.toLowerCase() || status}`, variant: "success" });
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!confirm("Eliminare questa fattura? L'azione non è reversibile.")) return;
    try {
      await api.invoices.delete(id);
      toast({ title: "Fattura eliminata", variant: "success" });
      router.push("/fatture");
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    }
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    try {
      const blob = await api.invoices.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice?.invoiceNumber || "fattura"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Errore nel download PDF", variant: "destructive" });
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleSendEmail() {
    setSendingEmail(true);
    try {
      await api.invoices.sendEmail(id);
      toast({ title: "Email inviata", description: `Fattura inviata a ${invoice?.customer?.email}`, variant: "success" });
      setSendEmailOpen(false);
    } catch (e) {
      toast({ title: "Errore invio email", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!invoice) return <p className="text-muted-foreground">Fattura non trovata.</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/fatture" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-700 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />Fatture
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-brand-900 font-mono">{invoice.invoiceNumber}</h1>
            <Badge variant={STATUS_VARIANT[invoice.status] || "secondary"}>{STATUS_LABELS[invoice.status] || invoice.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {/* PDF download — always visible */}
          <Button variant="outline" onClick={handleDownloadPdf} loading={downloadingPdf}>
            <Download className="w-4 h-4" />Scarica PDF
          </Button>

          {/* Email — visible when status ≠ BOZZA and customer has email */}
          {invoice.status !== "BOZZA" && invoice.customer?.email && (
            <Button variant="outline" onClick={() => setSendEmailOpen(true)}>
              <Mail className="w-4 h-4" />Invia Email
            </Button>
          )}

          {/* Status actions */}
          {invoice.status === "BOZZA" && (
            <>
              <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />Elimina
              </Button>
              <Button variant="accent" onClick={() => handleStatusChange("INVIATA")}>
                <Send className="w-4 h-4" />Invia
              </Button>
            </>
          )}
          {invoice.status === "INVIATA" && (
            <>
              <Button variant="outline" onClick={() => handleStatusChange("ANNULLATA")}>
                <Ban className="w-4 h-4" />Annulla
              </Button>
              <Button variant="accent" onClick={() => handleStatusChange("PAGATA")}>
                <CreditCard className="w-4 h-4" />Segna pagata
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Righe fattura</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-200">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2">Descrizione</th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-2 w-16">Qtà</th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-2 w-24">Prezzo</th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-2 w-24">Totale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 text-sm text-brand-900">{item.description}</td>
                      <td className="py-2.5 text-sm text-right text-muted-foreground">{item.quantity}</td>
                      <td className="py-2.5 text-sm text-right text-muted-foreground">{fmt(item.unitPrice)}</td>
                      <td className="py-2.5 text-sm text-right font-medium text-brand-900">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-brand-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Imponibile</span>
                  <span className="font-medium">{fmt(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA ({invoice.taxRate}%)</span>
                  <span className="font-medium">{fmt(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-brand-900 pt-1 border-t border-brand-100">
                  <span>Totale</span>
                  <span>{fmt(invoice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card className="mt-6">
              <CardHeader><CardTitle className="text-sm">Note</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p></CardContent>
            </Card>
          )}
        </div>

        {/* Details sidebar */}
        <div className="space-y-6">
          {invoice.customer && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
              <CardContent>
                <Link href={`/clienti/${invoice.customer.id}`} className="text-sm font-medium text-brand-900 hover:text-accent-gold transition-colors">
                  {invoice.customer.fullName}
                </Link>
                {invoice.customer.companyName && <p className="text-xs text-muted-foreground">{invoice.customer.companyName}</p>}
                <p className="text-xs text-muted-foreground">{invoice.customer.email}</p>
                {invoice.customer.vatNumber && <p className="text-xs text-muted-foreground font-mono mt-1">P.IVA: {invoice.customer.vatNumber}</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-sm">Dettagli</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Data emissione" value={new Date(invoice.issueDate).toLocaleDateString("it-IT")} />
              {invoice.dueDate && <DetailRow label="Scadenza" value={new Date(invoice.dueDate).toLocaleDateString("it-IT")} />}
              {invoice.paidDate && <DetailRow label="Data pagamento" value={new Date(invoice.paidDate).toLocaleDateString("it-IT")} />}
              {invoice.paymentMethod && <DetailRow label="Pagamento" value={invoice.paymentMethod} />}
              <DetailRow label="Creata il" value={new Date(invoice.createdAt).toLocaleDateString("it-IT")} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email confirmation dialog */}
      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invia fattura per email</DialogTitle>
            <DialogDescription>
              La fattura <strong>{invoice.invoiceNumber}</strong> verrà inviata con PDF allegato a{" "}
              <strong>{invoice.customer?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendEmailOpen(false)}>Annulla</Button>
            <Button variant="accent" onClick={handleSendEmail} loading={sendingEmail}>
              <Mail className="w-4 h-4" />Invia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-brand-900">{value}</span>
    </div>
  );
}
