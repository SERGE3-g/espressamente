"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ComodatoRequest } from "@/lib/api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, FileText, Save } from "lucide-react";

const STATUS_OPTIONS = ["NUOVO", "IN_LAVORAZIONE", "COMPLETATO", "ARCHIVIATO"];
const STATUS_LABELS: Record<string, string> = {
  NUOVO: "Nuovo",
  IN_LAVORAZIONE: "In lavorazione",
  COMPLETATO: "Completato",
  ARCHIVIATO: "Archiviato",
};

export default function ComodatoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ComodatoRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") return;
    api.comodato
      .getById(Number(id))
      .then((data) => {
        setItem(data);
        setNotes(data.internalNotes ?? "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: string) {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await api.comodato.updateStatus(
        item.id,
        status,
        notes || undefined
      );
      setItem(updated);
      toast({
        title: "Stato aggiornato",
        description: `Richiesta impostata come "${STATUS_LABELS[status]}"`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Errore",
        description: e instanceof Error ? e.message : "Errore aggiornamento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await api.comodato.updateStatus(
        item.id,
        item.status,
        notes || undefined
      );
      setItem(updated);
      toast({
        title: "Note salvate",
        description: "Le note interne sono state aggiornate",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Errore",
        description:
          e instanceof Error ? e.message : "Errore salvataggio note",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <Skeleton className="h-5 w-32 bg-brand-100" />
        <Skeleton className="h-8 w-64 bg-brand-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full bg-brand-50" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full bg-brand-50" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <p className="text-muted-foreground mb-4">Richiesta non trovata.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Torna indietro
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Torna alla lista
      </button>

      {/* Title + status */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-brand-900">
          {item.fullName}
        </h1>
        <StatusBadge status={item.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer data */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-brand-400" />
              Dati cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nome" value={item.fullName} />
            <InfoRow label="Email" value={item.email} />
            <InfoRow label="Telefono" value={item.phone} />
            {item.companyName && (
              <InfoRow label="Azienda" value={item.companyName} />
            )}
            <InfoRow label="Citta" value={item.city} />
            {item.province && (
              <InfoRow label="Provincia" value={item.province} />
            )}
          </CardContent>
        </Card>

        {/* Request details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-brand-400" />
              Dettagli richiesta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.machineName && (
              <InfoRow label="Macchinetta" value={item.machineName} />
            )}
            <InfoRow
              label="Consegna"
              value={
                item.deliveryType === "CONSEGNA"
                  ? "Consegna a domicilio"
                  : "Ritiro in sede"
              }
            />
            <InfoRow
              label="Data"
              value={new Date(item.createdAt).toLocaleString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Status management */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Aggiorna stato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={item.status === s ? "default" : "outline"}
                disabled={saving || item.status === s}
                onClick={() => handleStatusChange(s)}
                loading={saving && item.status !== s}
              >
                {STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Internal notes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Note interne</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes" className="sr-only">
            Note interne
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Aggiungi note interne..."
          />
          <Button
            size="sm"
            className="mt-3"
            onClick={saveNotes}
            loading={saving}
          >
            <Save className="w-4 h-4 mr-1" />
            Salva note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-brand-900 font-medium">{value}</span>
    </div>
  );
}
