"use client";

import { useRouter } from "next/navigation";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function NuovoDipendentePage() {
  const router = useRouter();

  async function handleSubmit(data: {
    username: string;
    password?: string;
    fullName: string;
    email: string;
    role: string;
    storeId?: number | null;
  }) {
    await api.users.create(data);
    toast({ title: "Dipendente creato", variant: "success" });
    router.push("/dipendenti");
  }

  return (
    <>
      <PageHeader title="Nuovo dipendente" description="Crea un account per un dipendente" />
      <EmployeeForm onSubmit={handleSubmit} />
    </>
  );
}
