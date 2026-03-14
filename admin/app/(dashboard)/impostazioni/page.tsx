"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { User, Lock, Info } from "lucide-react";

export default function ImpostazioniPage() {
  const user = useAuthStore((s) => s.user);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      toast({ title: "Le password non coincidono", variant: "warning" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "La password deve avere almeno 6 caratteri", variant: "warning" });
      return;
    }
    setSaving(true);
    try {
      await api.settings.changePassword(oldPassword, newPassword);
      toast({ title: "Password aggiornata", variant: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Password attuale non corretta", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-900">Impostazioni</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestione account e configurazione</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm">Profilo utente</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nome completo" value={user?.fullName ?? "—"} />
            <InfoRow label="Username" value={user?.username ?? "—"} />
            <InfoRow label="Email" value={user?.email ?? "—"} />
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-400" />
              <div>
                <CardTitle className="text-sm">Cambia password</CardTitle>
                <CardDescription>Modifica la password del tuo account admin</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="old-pw">Password attuale</Label>
              <Input id="old-pw" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">Nuova password</Label>
              <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimo 6 caratteri" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Conferma password</Label>
              <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ripeti la nuova password" />
            </div>
            <Button
              variant="default"
              onClick={handleChangePassword}
              loading={saving}
              disabled={!oldPassword || !newPassword || !confirmPassword}
            >
              Aggiorna password
            </Button>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-400" />
              <CardTitle className="text-sm">Informazioni sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Versione admin" value="2.0.0" />
            <InfoRow label="Backend" value="Spring Boot 3.4.3" />
            <InfoRow label="Ambiente" value={process.env.NODE_ENV ?? "development"} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-brand-900 font-medium">{value}</span>
    </div>
  );
}
