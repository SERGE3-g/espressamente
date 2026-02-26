"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const schema = z.object({
  fullName: z.string().min(2, "Nome troppo corto"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Messaggio troppo corto (min 10 caratteri)"),
  contactType: z.enum(["INFO", "PREVENTIVO", "ASSISTENZA", "ALTRO"]),
});

type FormData = z.infer<typeof schema>;

const contactTypeOptions = [
  { value: "INFO", label: "Informazioni" },
  { value: "PREVENTIVO", label: "Preventivo" },
  { value: "ASSISTENZA", label: "Assistenza" },
  { value: "ALTRO", label: "Altro" },
];

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { contactType: "INFO" },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.contact.submit(data);
      setSuccess(true);
      reset();
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Errore durante l'invio.");
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <p className="text-lg font-semibold text-green-800">Messaggio inviato!</p>
        <p className="text-green-600 mt-2">Ti risponderemo il prima possibile.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-700 underline"
        >
          Invia un altro messaggio
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Telefono"
          type="tel"
          placeholder="+39 000 0000000"
          {...register("phone")}
        />
        <Select
          label="Tipo richiesta *"
          options={contactTypeOptions}
          error={errors.contactType?.message}
          {...register("contactType")}
        />
      </div>

      <Input
        label="Oggetto"
        placeholder="Oggetto del messaggio"
        {...register("subject")}
      />

      <Textarea
        label="Messaggio *"
        placeholder="Scrivi il tuo messaggio..."
        error={errors.message?.message}
        {...register("message")}
      />

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Invio in corso..." : "Invia messaggio"}
      </Button>
    </form>
  );
}
