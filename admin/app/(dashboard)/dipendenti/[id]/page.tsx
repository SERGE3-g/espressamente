"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { api, AdminUserItem } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function ModificaDipendentePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [user, setUser] = useState<AdminUserItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    api.users
      .getById(id)
      .then(setUser)
      .catch(() => toast({ title: "Utente non trovato", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleSubmit(data: {
    username: string;
    password?: string;
    fullName: string;
    email: string;
    role: string;
    storeId?: number | null;
  }) {
    await api.users.update(id, data);
    toast({ title: "Dipendente aggiornato", variant: "success" });
    router.push("/dipendenti");
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Caricamento...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Utente non trovato</div>;
  }

  return (
    <>
      <PageHeader
        title={`Modifica: ${user.fullName}`}
        description={`@${user.username}`}
      />
      <EmployeeForm
        defaultValues={{
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          storeId: user.storeId,
        }}
        isEdit
        onSubmit={handleSubmit}
      />
    </>
  );
}
