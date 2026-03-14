"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import Image from "next/image";
import type { Product } from "@/types";

const schema = z
  .object({
    clientType:    z.enum(["PRIVATO", "AZIENDA"]),
    vatNumber:     z.string().max(20).optional(),
    fullName:      z.string().min(2, "Nome troppo corto").max(100),
    email:         z.string().email("Email non valida"),
    phone:         z.string().min(6, "Telefono obbligatorio").max(20),
    companyName:   z.string().max(150).optional(),
    address:       z.string().max(255).optional(),
    city:          z.string().min(2, "Città obbligatoria").max(100),
    province:      z.string().max(5).optional(),
    machineId:     z.number().optional(),
    machineName:   z.string().max(200).optional(),
    deliveryType:  z.enum(["CONSEGNA", "RITIRO"], { required_error: "Seleziona la modalità" }),
    notes:         z.string().max(2000).optional(),
    privacyConsent: z.literal(true, { errorMap: () => ({ message: "Devi accettare il trattamento dei dati" }) }),
  })
  .superRefine((data, ctx) => {
    if (data.clientType === "AZIENDA") {
      if (!data.companyName || data.companyName.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "Ragione sociale obbligatoria per le aziende" });
      }
      if (!data.vatNumber || data.vatNumber.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["vatNumber"], message: "P.IVA obbligatoria per le aziende" });
      }
    }
  });

type FormData = z.infer<typeof schema>;

interface Props {
  machines: Product[];
}

export function ComodatoForm({ machines }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clientType: "PRIVATO", deliveryType: "CONSEGNA" },
  });

  const clientType = watch("clientType");
  const selectedMachineId = watch("machineId");

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.comodato.submit({
        ...data,
        privacyConsent: true,
      });
      router.push("/?richiesta=inviata");
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Errore durante l'invio.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Tipo cliente */}
      <div>
        <h3 className="text-base font-semibold text-brand-900 mb-3">Sei un privato o un&apos;azienda?</h3>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {(["PRIVATO", "AZIENDA"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue("clientType", type)}
              className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                clientType === type
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 text-brand-700 hover:border-brand-400 bg-white"
              }`}
            >
              {type === "PRIVATO" ? "👤 Privato" : "🏢 Azienda"}
            </button>
          ))}
        </div>
      </div>

      {/* Dati personali / azienda */}
      <div>
        <h3 className="text-base font-semibold text-brand-900 mb-4">I tuoi dati</h3>
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
          <Input
            label="Telefono *"
            type="tel"
            placeholder="+39 000 0000000"
            error={errors.phone?.message}
            {...register("phone")}
          />

          {clientType === "AZIENDA" ? (
            <>
              <Input
                label="Ragione Sociale *"
                placeholder="Acme S.r.l."
                error={errors.companyName?.message}
                {...register("companyName")}
              />
              <Input
                label="P.IVA *"
                placeholder="IT12345678901"
                error={errors.vatNumber?.message}
                {...register("vatNumber")}
              />
            </>
          ) : (
            <Input
              label="Azienda / Attività"
              placeholder="Bar Centrale (opzionale)"
              error={errors.companyName?.message}
              {...register("companyName")}
            />
          )}
        </div>
      </div>

      {/* Indirizzo */}
      <div>
        <h3 className="text-base font-semibold text-brand-900 mb-4">Indirizzo di consegna</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Indirizzo"
              placeholder="Via Roma 1"
              error={errors.address?.message}
              {...register("address")}
            />
          </div>
          <Input
            label="Città *"
            placeholder="Formia"
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            label="Provincia"
            placeholder="LT"
            error={errors.province?.message}
            {...register("province")}
          />
        </div>
      </div>

      {/* Scelta macchina */}
      <div>
        <h3 className="text-base font-semibold text-brand-900 mb-4">Macchina desiderata</h3>
        {machines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {machines.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setValue("machineId", selectedMachineId === m.id ? undefined : m.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedMachineId === m.id
                    ? "border-brand-600 bg-brand-50"
                    : "border-brand-100 hover:border-brand-300 bg-white"
                }`}
              >
                {m.images?.[0] && (
                  <div className="relative w-full h-28 mb-2">
                    <Image
                      src={m.images[0]}
                      alt={m.name}
                      fill
                      className="object-contain rounded"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                )}
                <p className="text-sm font-semibold text-brand-900 leading-tight">{m.name}</p>
                {m.brand && <p className="text-xs text-brand-500 mt-0.5">{m.brand.name}</p>}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setValue("machineId", undefined)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                !selectedMachineId
                  ? "border-brand-600 bg-brand-50"
                  : "border-brand-100 hover:border-brand-300 bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-brand-900">Non lo so ancora</p>
              <p className="text-xs text-brand-500 mt-0.5">Ti aiuteremo a scegliere</p>
            </button>
          </div>
        ) : (
          <Input
            label="Modello macchina"
            placeholder="Es. Macchina espresso automatica"
            error={errors.machineName?.message}
            {...register("machineName")}
          />
        )}
      </div>

      {/* Consegna */}
      <div>
        <h3 className="text-base font-semibold text-brand-900 mb-4">Modalità di ritiro</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: "CONSEGNA", label: "📦 Consegna a domicilio", desc: "Portiamo la macchina da te" },
            { value: "RITIRO",   label: "🏪 Ritiro in negozio",   desc: "Passi tu in uno dei nostri punti vendita" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("deliveryType", opt.value as "CONSEGNA" | "RITIRO")}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                watch("deliveryType") === opt.value
                  ? "border-brand-600 bg-brand-50"
                  : "border-brand-100 hover:border-brand-300 bg-white"
              }`}
            >
              <p className="font-semibold text-brand-900 text-sm">{opt.label}</p>
              <p className="text-xs text-brand-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
        {errors.deliveryType && (
          <p className="text-sm text-red-500 mt-1">{errors.deliveryType.message}</p>
        )}
      </div>

      {/* Note */}
      <Textarea
        label="Note aggiuntive"
        placeholder="Qualcosa che vuoi comunicarci? (orari, esigenze particolari...)"
        error={errors.notes?.message}
        {...register("notes")}
      />

      {/* Privacy consent */}
      <div className="flex items-start gap-3">
        <input
          id="privacyConsent"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
          {...register("privacyConsent")}
        />
        <label htmlFor="privacyConsent" className="text-sm text-brand-700 leading-relaxed">
          Accetto il trattamento dei miei dati personali ai sensi del{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-900">
            Regolamento UE 2016/679 (GDPR)
          </a>{" "}
          per essere contattato riguardo la richiesta di comodato. *
        </label>
      </div>
      {errors.privacyConsent && (
        <p className="text-sm text-red-500 -mt-4">{errors.privacyConsent.message}</p>
      )}

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{serverError}</p>
      )}

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
        {isSubmitting ? "Invio in corso..." : "Invia richiesta comodato"}
      </Button>
    </form>
  );
}
