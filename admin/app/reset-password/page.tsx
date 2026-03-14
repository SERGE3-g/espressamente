"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Eye, EyeOff, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  newPassword: z.string().min(8, "Minimo 8 caratteri"),
  confirmPassword: z.string().min(1, "Conferma la password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!token) return;
    setServerError(null);
    try {
      await api.auth.resetPassword(token, data.newPassword);
      setSuccess(true);
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Errore nel reset");
    }
  }

  const noToken = !token;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 relative overflow-hidden px-6 py-12">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-200/30 blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent-gold/10 blur-[80px] translate-y-1/2 -translate-x-1/3" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div
          className={`text-center mb-10 ${mounted ? "animate-login-rise" : "opacity-0"}`}
          style={{ animationDelay: "0.1s" }}
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-900 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-900/20">
            <Coffee className="w-7 h-7 text-accent-gold" />
          </div>
          <h1
            className="text-2xl text-brand-900 tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Espressamente
          </h1>
        </div>

        {/* Card */}
        <div
          className={`${mounted ? "animate-login-rise" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-brand-200/60 shadow-elevated p-8">
            {noToken ? (
              /* No token */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <h2
                  className="text-xl text-brand-900 font-medium tracking-tight mb-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Link non valido
                </h2>
                <p className="text-sm text-brand-500 mb-6">
                  Il link di reset non contiene un token valido. Richiedi un nuovo reset.
                </p>
                <Link href="/forgot-password">
                  <Button variant="outline">Richiedi nuovo reset</Button>
                </Link>
              </div>
            ) : success ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2
                  className="text-xl text-brand-900 font-medium tracking-tight mb-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Password reimpostata
                </h2>
                <p className="text-sm text-brand-500 mb-6">
                  La tua password è stata aggiornata. Ora puoi accedere.
                </p>
                <Link href="/login">
                  <Button className="gap-2">
                    Vai al login
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-7">
                  <h2
                    className="text-xl text-brand-900 font-medium tracking-tight"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Nuova password
                  </h2>
                  <p className="text-sm text-brand-500 mt-1">
                    Scegli una nuova password per il tuo account.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-brand-700 text-sm font-medium">
                      Nuova password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimo 8 caratteri"
                        autoComplete="new-password"
                        className="h-11 bg-white/80 border-brand-200/80 focus-visible:bg-white pr-11"
                        {...register("newPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-brand-700 text-sm font-medium">
                      Conferma password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ripeti la password"
                      autoComplete="new-password"
                      className="h-11 bg-white/80 border-brand-200/80 focus-visible:bg-white"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {serverError && (
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl p-3.5 animate-login-fade">
                      <p className="text-sm text-red-700">{serverError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 text-sm"
                    loading={isSubmitting}
                  >
                    Reimposta password
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
