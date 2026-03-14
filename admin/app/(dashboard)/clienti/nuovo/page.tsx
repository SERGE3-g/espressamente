"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function NuovoClientePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [clientType, setClientType] = useState("PRIVATO");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [fiscalCode, setFiscalCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [cap, setCap] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    if (!fullName.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const data = await api.customers.create({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        companyName: companyName.trim() || undefined,
        vatNumber: vatNumber.trim() || undefined,
        fiscalCode: fiscalCode.trim() || undefined,
        clientType,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        cap: cap.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast({ title: "Cliente creato", variant: "success" });
      router.push(`/clienti/${data.id}`);
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
          <Link href="/clienti" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-700 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Clienti
          </Link>
          <h1 className="text-2xl font-semibold text-brand-900">Nuovo cliente</h1>
        </div>
        <Button variant="accent" onClick={handleSave} loading={saving} disabled={!fullName.trim() || !email.trim()}>
          <Save className="w-4 h-4" />
          Salva
        </Button>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 mb-6">
        {["PRIVATO", "AZIENDA"].map((t) => (
          <button
            key={t}
            onClick={() => setClientType(t)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              clientType === t
                ? "bg-brand-800 text-white border-brand-800"
                : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
            }`}
          >
            {t === "PRIVATO" ? "Privato" : "Azienda"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informazioni personali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome completo *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mario Rossi" />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario@esempio.it" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39 333 1234567" />
            </div>
            <div className="space-y-1.5">
              <Label>Codice Fiscale</Label>
              <Input value={fiscalCode} onChange={(e) => setFiscalCode(e.target.value.toUpperCase())} placeholder="RSSMRA80A01H501U" maxLength={16} className="font-mono" />
            </div>
            {clientType === "AZIENDA" && (
              <>
                <div className="space-y-1.5">
                  <Label>Ragione sociale</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Azienda S.r.l." />
                </div>
                <div className="space-y-1.5">
                  <Label>Partita IVA</Label>
                  <Input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="IT01234567890" maxLength={13} className="font-mono" />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Indirizzo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Via / Indirizzo</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Via Roma 1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Città</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Milano" />
                </div>
                <div className="space-y-1.5">
                  <Label>Prov.</Label>
                  <Input value={province} onChange={(e) => setProvince(e.target.value.toUpperCase())} placeholder="MI" maxLength={2} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>CAP</Label>
                <Input value={cap} onChange={(e) => setCap(e.target.value)} placeholder="20100" maxLength={5} className="font-mono" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Note interne sul cliente..."
                rows={4}
                className="flex w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
