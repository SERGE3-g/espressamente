"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Customer, CustomerInteraction, ComodatoRequest, ContactRequest, ServiceRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Save, UserX, Plus,
  Phone, Mail, MapPin, Building2,
  MessageSquare, Wrench, Coffee, Clock,
} from "lucide-react";

const INTERACTION_TYPES = [
  { value: "NOTA", label: "Nota" },
  { value: "CHIAMATA", label: "Chiamata" },
  { value: "EMAIL", label: "Email" },
  { value: "INCONTRO", label: "Incontro" },
  { value: "PREVENTIVO", label: "Preventivo" },
];

const TABS = ["info", "interazioni", "richieste"] as const;
type Tab = (typeof TABS)[number];

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", companyName: "", vatNumber: "",
    fiscalCode: "", clientType: "PRIVATO", address: "", city: "",
    province: "", cap: "", notes: "",
  });

  // Interactions
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [interactionDialog, setInteractionDialog] = useState(false);
  const [newInteraction, setNewInteraction] = useState({ type: "NOTA", subject: "", description: "" });
  const [savingInteraction, setSavingInteraction] = useState(false);

  // Linked requests
  const [comodatoReqs, setComodatoReqs] = useState<ComodatoRequest[]>([]);
  const [contattiReqs, setContattiReqs] = useState<ContactRequest[]>([]);
  const [assistenzaReqs, setAssistenzaReqs] = useState<ServiceRequest[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);

  const loadCustomer = useCallback(() => {
    setLoading(true);
    api.customers.getById(id)
      .then((c) => {
        setCustomer(c);
        setForm({
          fullName: c.fullName, email: c.email, phone: c.phone || "",
          companyName: c.companyName || "", vatNumber: c.vatNumber || "",
          fiscalCode: c.fiscalCode || "", clientType: c.clientType,
          address: c.address || "", city: c.city || "",
          province: c.province || "", cap: c.cap || "", notes: c.notes || "",
        });
      })
      .catch(() => toast({ title: "Cliente non trovato", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id]);

  const loadInteractions = useCallback(() => {
    setLoadingInteractions(true);
    api.customerInteractions.getByCustomer(id)
      .then(setInteractions)
      .catch(() => {})
      .finally(() => setLoadingInteractions(false));
  }, [id]);

  const loadRequests = useCallback(() => {
    setLoadingReqs(true);
    Promise.all([
      api.customers.getComodato(id).catch(() => []),
      api.customers.getContatti(id).catch(() => []),
      api.customers.getAssistenza(id).catch(() => []),
    ]).then(([com, con, ass]) => {
      setComodatoReqs(com);
      setContattiReqs(con);
      setAssistenzaReqs(ass);
    }).finally(() => setLoadingReqs(false));
  }, [id]);

  useEffect(() => { loadCustomer(); }, [loadCustomer]);

  useEffect(() => {
    if (tab === "interazioni") loadInteractions();
    if (tab === "richieste") loadRequests();
  }, [tab, loadInteractions, loadRequests]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.customers.update(id, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        vatNumber: form.vatNumber.trim() || undefined,
        fiscalCode: form.fiscalCode.trim() || undefined,
        clientType: form.clientType,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        province: form.province.trim() || undefined,
        cap: form.cap.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setCustomer(updated);
      setEditing(false);
      toast({ title: "Cliente aggiornato", variant: "success" });
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore nel salvataggio", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm("Sei sicuro di voler disattivare questo cliente?")) return;
    try {
      await api.customers.deactivate(id);
      toast({ title: "Cliente disattivato", variant: "success" });
      router.push("/clienti");
    } catch {
      toast({ title: "Errore nella disattivazione", variant: "destructive" });
    }
  }

  async function handleCreateInteraction() {
    if (!newInteraction.type) return;
    setSavingInteraction(true);
    try {
      await api.customerInteractions.create(id, newInteraction);
      setInteractionDialog(false);
      setNewInteraction({ type: "NOTA", subject: "", description: "" });
      loadInteractions();
      toast({ title: "Interazione aggiunta", variant: "success" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    } finally {
      setSavingInteraction(false);
    }
  }

  async function handleDeleteInteraction(interactionId: number) {
    if (!confirm("Eliminare questa interazione?")) return;
    try {
      await api.customerInteractions.delete(id, interactionId);
      loadInteractions();
      toast({ title: "Interazione eliminata", variant: "success" });
    } catch {
      toast({ title: "Errore", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) {
    return <p className="text-muted-foreground">Cliente non trovato.</p>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/clienti" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-700 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Clienti
          </Link>
          <h1 className="text-2xl font-semibold text-brand-900">{customer.fullName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={customer.clientType === "AZIENDA" ? "info" : "secondary"}>
              {customer.clientType === "AZIENDA" ? "Azienda" : "Privato"}
            </Badge>
            {customer.companyName && <span className="text-sm text-muted-foreground">{customer.companyName}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>Annulla</Button>
              <Button variant="accent" onClick={handleSave} loading={saving} disabled={!form.fullName.trim() || !form.email.trim()}>
                <Save className="w-4 h-4" /> Salva
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleDeactivate} className="text-red-600 hover:text-red-700">
                <UserX className="w-4 h-4" /> Disattiva
              </Button>
              <Button variant="accent" onClick={() => setEditing(true)}>Modifica</Button>
            </>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Comodato", value: customer.totalComodato, icon: Coffee },
          { label: "Contatti", value: customer.totalContatti, icon: MessageSquare },
          { label: "Assistenza", value: customer.totalAssistenza, icon: Wrench },
          { label: "Interazioni", value: customer.totalInteractions, icon: Clock },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-100">
                <s.icon className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-brand-900">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-brand-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-accent-gold text-accent-gold"
                : "border-transparent text-muted-foreground hover:text-brand-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Informazioni personali</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <Field label="Nome completo *" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
                  <Field label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                  <Field label="Telefono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field label="Codice Fiscale" value={form.fiscalCode} onChange={(v) => setForm({ ...form, fiscalCode: v.toUpperCase() })} maxLength={16} mono />
                  {form.clientType === "AZIENDA" && (
                    <>
                      <Field label="Ragione sociale" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} />
                      <Field label="Partita IVA" value={form.vatNumber} onChange={(v) => setForm({ ...form, vatNumber: v })} maxLength={13} mono />
                    </>
                  )}
                  <div className="flex gap-2 pt-2">
                    {["PRIVATO", "AZIENDA"].map((t) => (
                      <button key={t} onClick={() => setForm({ ...form, clientType: t })}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          form.clientType === t ? "bg-brand-800 text-white border-brand-800" : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
                        }`}>{t === "PRIVATO" ? "Privato" : "Azienda"}</button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={Mail} label="Email" value={customer.email} />
                  <InfoRow icon={Phone} label="Telefono" value={customer.phone} />
                  {customer.fiscalCode && <InfoRow label="Codice Fiscale" value={customer.fiscalCode} mono />}
                  {customer.companyName && <InfoRow icon={Building2} label="Azienda" value={customer.companyName} />}
                  {customer.vatNumber && <InfoRow label="P.IVA" value={customer.vatNumber} mono />}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Indirizzo</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <Field label="Via / Indirizzo" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2"><Field label="Città" value={form.city} onChange={(v) => setForm({ ...form, city: v })} /></div>
                      <Field label="Prov." value={form.province} onChange={(v) => setForm({ ...form, province: v.toUpperCase() })} maxLength={2} />
                    </div>
                    <Field label="CAP" value={form.cap} onChange={(v) => setForm({ ...form, cap: v })} maxLength={5} mono />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customer.address || customer.city ? (
                      <InfoRow icon={MapPin} value={[customer.address, [customer.cap, customer.city, customer.province].filter(Boolean).join(" ")].filter(Boolean).join(", ")} />
                    ) : (
                      <p className="text-sm text-muted-foreground">Nessun indirizzo</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Note</CardTitle></CardHeader>
              <CardContent>
                {editing ? (
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={4} placeholder="Note interne..."
                    className="flex w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold" />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes || "Nessuna nota"}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "interazioni" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button variant="accent" onClick={() => setInteractionDialog(true)}>
              <Plus className="w-4 h-4" /> Nuova interazione
            </Button>
          </div>
          {loadingInteractions ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : interactions.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Nessuna interazione registrata</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {interactions.map((i) => (
                <Card key={i.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{INTERACTION_TYPES.find((t) => t.value === i.type)?.label || i.type}</Badge>
                          {i.subject && <span className="text-sm font-medium text-brand-900">{i.subject}</span>}
                        </div>
                        {i.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{i.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-brand-400">
                          <span>{new Date(i.date).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          {i.adminFullName && <span>di {i.adminFullName}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteInteraction(i.id)} className="text-brand-400 hover:text-red-500 transition-colors text-sm">
                        Elimina
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* New interaction dialog */}
          <Dialog open={interactionDialog} onOpenChange={setInteractionDialog}>
            <DialogContent>
              <DialogHeader><DialogTitle>Nuova interazione</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tipo *</Label>
                  <select value={newInteraction.type} onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-brand-200 bg-white px-3 text-sm">
                    {INTERACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Oggetto</Label>
                  <Input value={newInteraction.subject} onChange={(e) => setNewInteraction({ ...newInteraction, subject: e.target.value })} placeholder="Oggetto..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrizione</Label>
                  <textarea value={newInteraction.description} onChange={(e) => setNewInteraction({ ...newInteraction, description: e.target.value })}
                    rows={4} placeholder="Dettagli..."
                    className="flex w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInteractionDialog(false)}>Annulla</Button>
                <Button variant="accent" onClick={handleCreateInteraction} loading={savingInteraction}>Salva</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {tab === "richieste" && (
        <div className="space-y-6">
          {loadingReqs ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (
            <>
              <RequestSection title="Comodato" icon={Coffee} items={comodatoReqs} renderItem={(r) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-900">{r.machineName || "Macchina"}</p>
                    <p className="text-xs text-muted-foreground">{r.city} · {r.deliveryType}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={r.status === "NUOVO" ? "warning" : r.status === "COMPLETATO" ? "success" : "secondary"}>{r.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString("it-IT")}</p>
                  </div>
                </div>
              )} />

              <RequestSection title="Contatti" icon={MessageSquare} items={contattiReqs} renderItem={(r) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-900">{r.subject || "Messaggio"}</p>
                    <p className="text-xs text-muted-foreground">{r.contactType}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={r.status === "NUOVO" ? "warning" : r.status === "COMPLETATO" ? "success" : "secondary"}>{r.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString("it-IT")}</p>
                  </div>
                </div>
              )} />

              <RequestSection title="Assistenza" icon={Wrench} items={assistenzaReqs} renderItem={(r) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-900">{r.machineBrand} {r.machineModel}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{r.issueDescription}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={r.status === "NUOVO" ? "warning" : r.status === "COMPLETATO" ? "success" : "secondary"}>{r.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString("it-IT")}</p>
                  </div>
                </div>
              )} />
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── Helper components ───────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", maxLength, mono }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; maxLength?: number; mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength} className={mono ? "font-mono" : ""} />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono }: {
  icon?: React.ComponentType<{ className?: string }>; label?: string; value?: string | null; mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-brand-400 shrink-0" />}
      {label && <span className="text-xs text-brand-400 w-20 shrink-0">{label}</span>}
      <span className={`text-sm text-brand-900 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function RequestSection<T>({ title, icon: Icon, items, renderItem }: {
  title: string; icon: React.ComponentType<{ className?: string }>;
  items: T[]; renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-brand-600" />
        <h3 className="text-sm font-medium text-brand-900">{title}</h3>
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">Nessuna richiesta</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <Card key={i}><CardContent className="p-4">{renderItem(item)}</CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
