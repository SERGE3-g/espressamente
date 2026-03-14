"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import { api, AdminUserItem } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  STORE_MANAGER: "Responsabile",
  EMPLOYEE: "Dipendente",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "info"> = {
  SUPER_ADMIN: "default",
  STORE_MANAGER: "info",
  EMPLOYEE: "secondary",
};

export default function DipendentiPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(() => {
    setLoading(true);
    api.users
      .getAll()
      .then(setUsers)
      .catch(() => toast({ title: "Errore", description: "Impossibile caricare gli utenti", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggleActive(user: AdminUserItem) {
    try {
      await api.users.toggleActive(user.id);
      toast({
        title: user.isActive ? "Utente disattivato" : "Utente attivato",
        variant: "success",
      });
      loadUsers();
    } catch {
      toast({ title: "Errore", description: "Operazione fallita", variant: "destructive" });
    }
  }

  return (
    <>
      <PageHeader
        title="Dipendenti"
        description="Gestisci utenti e permessi per i punti vendita"
        action={
          <Link href="/dipendenti/nuovo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo dipendente
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, username o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Caricamento...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search ? "Nessun risultato" : "Nessun dipendente registrato"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Utente
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Ruolo
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Negozio
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Stato
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-brand-900">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            @{user.username} &middot; {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ROLE_VARIANTS[user.role] ?? "secondary"}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.storeName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.isActive ? "success" : "destructive"}>
                          {user.isActive ? "Attivo" : "Disattivato"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dipendenti/${user.id}`}>
                            <Button variant="ghost" size="icon" title="Modifica">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={user.isActive ? "Disattiva" : "Attiva"}
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.isActive ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
