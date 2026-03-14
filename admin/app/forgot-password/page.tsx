"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  email: z.string().min(1, "Email obbligatoria").email("Email non valida"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.auth.forgotPassword(data.email);
      setSent(true);
    } catch (e: unknown) {
      setServerError(e instanceof Error ? e.message : "Errore nell'invio");
    }
  }

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
            {sent ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2
                  className="text-xl text-brand-900 font-medium tracking-tight mb-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Email inviata
                </h2>
                <p className="text-sm text-brand-500 leading-relaxed mb-6">
                  Se l&apos;indirizzo corrisponde a un account, riceverai un&apos;email con il link per reimpostare la password.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Torna al login
                  </Button>
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-7">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-brand-600" />
                  </div>
                  <h2
                    className="text-xl text-brand-900 font-medium tracking-tight"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    Password dimenticata?
                  </h2>
                  <p className="text-sm text-brand-500 mt-1">
                    Inserisci la tua email e ti invieremo un link per reimpostarla.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-brand-700 text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="La tua email"
                      autoComplete="email"
                      className="h-11 bg-white/80 border-brand-200/80 focus-visible:bg-white"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
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
                    Invia link di reset
                  </Button>
                </form>

                <div className="mt-5 text-center">
                  <Link
                    href="/login"
                    className="text-sm text-brand-500 hover:text-accent-gold transition-colors inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Torna al login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
