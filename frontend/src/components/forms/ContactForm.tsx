"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const schema = z.object({
  fullName:       z.string().min(2, "Nome troppo corto"),
  email:          z.string().email("Email non valida"),
  phone:          z.string().optional(),
  companyName:    z.string().max(150).optional(),
  subject:        z.string().optional(),
  message:        z.string().min(10, "Messaggio troppo corto (min 10 caratteri)"),
  contactType:    z.enum(["INFO", "PREVENTIVO", "ASSISTENZA", "ALTRO"]),
  privacyConsent: z.literal(true, { errorMap: () => ({ message: "Devi accettare il trattamento dei dati" }) }),
});

type FormData = z.infer<typeof schema>;

const contactTypeOptions = [
  { value: "INFO",        label: "Informazioni" },
  { value: "PREVENTIVO",  label: "Preventivo" },
  { value: "ASSISTENZA",  label: "Assistenza" },
  { value: "ALTRO",       label: "Altro" },
];

export function ContactForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { contactType: "INFO" },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.contact.submit({ ...data, privacyConsent: true });
      router.push("/?richiesta=inviata");
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Errore durante l'invio.");
    }
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
        <Input
          label="Azienda / Attività"
          placeholder="Bar Centrale (opzionale)"
          error={errors.companyName?.message}
          {...register("companyName")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tipo richiesta *"
          options={contactTypeOptions}
          error={errors.contactType?.message}
          {...register("contactType")}
        />
        <Input
          label="Oggetto"
          placeholder="Oggetto del messaggio"
          {...register("subject")}
        />
      </div>

      <Textarea
        label="Messaggio *"
        placeholder="Scrivi il tuo messaggio..."
        error={errors.message?.message}
        {...register("message")}
      />

      {/* Privacy consent */}
      <div className="flex items-start gap-3">
        <input
          id="privacyConsent"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          {...register("privacyConsent")}
        />
        <label htmlFor="privacyConsent" className="text-sm text-gray-600 leading-relaxed">
          Accetto il trattamento dei miei dati personali ai sensi del{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-900">
            Regolamento UE 2016/679 (GDPR)
          </a>
          . *
        </label>
      </div>
      {errors.privacyConsent && (
        <p className="text-sm text-red-500 -mt-2">{errors.privacyConsent.message}</p>
      )}

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Invio in corso..." : "Invia messaggio"}
      </Button>
    </form>
  );
}
