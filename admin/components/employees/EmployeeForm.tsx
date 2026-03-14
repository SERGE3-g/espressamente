"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectNative } from "@/components/ui/select-native";
import { api, StoreItem } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin — accesso completo" },
  { value: "STORE_MANAGER", label: "Responsabile negozio" },
  { value: "EMPLOYEE", label: "Dipendente" },
];

interface Props {
  defaultValues?: {
    username: string;
    fullName: string;
    email: string;
    role: string;
    storeId: number | null;
  };
  isEdit?: boolean;
  onSubmit: (data: {
    username: string;
    password?: string;
    fullName: string;
    email: string;
    role: string;
    storeId?: number | null;
  }) => Promise<void>;
}

export function EmployeeForm({ defaultValues, isEdit, onSubmit }: Props) {
  const router = useRouter();
  const [stores, setStores] = useState<StoreItem[]>([]);

  const schema = z
    .object({
      username: z.string().min(3, "Minimo 3 caratteri").max(50),
      password: isEdit
        ? z.string().optional()
        : z.string().min(6, "Minimo 6 caratteri"),
      fullName: z.string().min(1, "Nome obbligatorio").max(100),
      email: z.string().email("Email non valida"),
      role: z.string().min(1, "Seleziona un ruolo"),
      storeId: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.role !== "SUPER_ADMIN" && !data.storeId) return false;
        return true;
      },
      { message: "Seleziona un negozio", path: ["storeId"] }
    );

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: defaultValues?.username ?? "",
      password: "",
      fullName: defaultValues?.fullName ?? "",
      email: defaultValues?.email ?? "",
      role: defaultValues?.role ?? "EMPLOYEE",
      storeId: defaultValues?.storeId?.toString() ?? "",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    api.users
      .getStores()
      .then(setStores)
      .catch(() => toast({ title: "Errore caricamento negozi", variant: "destructive" }));
  }, []);

  async function handleFormSubmit(data: FormData) {
    try {
      await onSubmit({
        username: data.username,
        password: data.password || undefined,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        storeId: data.storeId ? Number(data.storeId) : null,
      });
    } catch (e: unknown) {
      toast({
        title: "Errore",
        description: e instanceof Error ? e.message : "Operazione fallita",
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="max-w-2xl space-y-6">
      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              disabled={isEdit}
              placeholder="es. mario.rossi"
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              {isEdit ? "Nuova password (lascia vuoto per non modificare)" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder={isEdit ? "••••••" : "Minimo 6 caratteri"}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informazioni personali */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informazioni personali</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" {...register("fullName")} placeholder="Mario Rossi" />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="mario@espressamente.eu" />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ruolo e negozio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ruolo e negozio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="role">Ruolo</Label>
            <SelectNative
              id="role"
              {...register("role")}
              options={ROLES}
              placeholder="Seleziona ruolo"
            />
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          {selectedRole !== "SUPER_ADMIN" && (
            <div>
              <Label htmlFor="storeId">Negozio assegnato</Label>
              <SelectNative
                id="storeId"
                {...register("storeId")}
                options={stores.map((s) => ({
                  value: String(s.id),
                  label: `${s.name}${s.city ? ` — ${s.city}` : ""}`,
                }))}
                placeholder="Seleziona negozio"
              />
              {errors.storeId && (
                <p className="text-sm text-red-500 mt-1">{errors.storeId.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Salva modifiche" : "Crea dipendente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dipendenti")}>
          Annulla
        </Button>
      </div>
    </form>
  );
}
