"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const schema = z.object({
  fullName: z.string().min(2, "Nome troppo corto"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  machineType: z.string().optional(),
  machineBrand: z.string().optional(),
  machineModel: z.string().optional(),
  issueDescription: z.string().min(10, "Descrivere il problema in dettaglio (min 10 caratteri)"),
  preferredDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ServiceRequestForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.service.submit(data);
      setSuccess(true);
      reset();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Errore durante l'invio.");
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <p className="text-lg font-semibold text-green-800">Richiesta inviata!</p>
        <p className="text-green-600 mt-2">Il nostro team ti contatterà presto.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-700 underline"
        >
          Invia un&apos;altra richiesta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nome e Cognome *"
          placeholder="Mario Rossi"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="Email *"
          type="email"
          placeholder="mario@esempio.it"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <Input
        label="Telefono"
        type="tel"
        placeholder="+39 000 0000000"
        {...register("phone")}
      />

      <p className="text-sm font-semibold text-brand-800 pt-2">Informazioni macchina</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Tipo macchina"
          placeholder="Espresso, Filtro..."
          {...register("machineType")}
        />
        <Input
          label="Brand"
          placeholder="La Marzocco..."
          {...register("machineBrand")}
        />
        <Input
          label="Modello"
          placeholder="Linea Mini..."
          {...register("machineModel")}
        />
      </div>

      <Textarea
        label="Descrizione problema *"
        placeholder="Descrivi il problema che hai riscontrato..."
        error={errors.issueDescription?.message}
        {...register("issueDescription")}
      />

      <Input
        label="Data preferita"
        type="date"
        {...register("preferredDate")}
      />

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Invio in corso..." : "Invia richiesta"}
      </Button>
    </form>
  );
}
