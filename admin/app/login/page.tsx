"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  username: z.string().min(1, "Username obbligatorio"),
  password: z.string().min(1, "Password obbligatoria"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    setShakeError(false);
    try {
      await login(data.username, data.password);
      router.push("/");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Errore di accesso";
      setServerError(msg);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Hero Panel (left) ── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden bg-brand-950">
        {/* Layered gradient atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-950 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-brand-900/30" />

        {/* Subtle grain texture */}
        <div
          className="animate-grain absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative pattern overlay */}
        <div className="login-hero-pattern absolute inset-0 opacity-[0.06]" />

        {/* Warm radial glow */}
        <div className="animate-glow-pulse absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-700/20 blur-[120px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Top — Logo */}
          <div
            className={`${mounted ? "animate-login-fade" : "opacity-0"}`}
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-accent-gold" />
              </div>
              <span className="text-brand-200 text-lg tracking-wide font-light">
                Espressamente
              </span>
            </div>
          </div>

          {/* Center — Hero text */}
          <div className="max-w-md">
            <div
              className={`${mounted ? "animate-login-rise" : "opacity-0"}`}
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-end gap-3 mb-6">
                {/* Decorative coffee cup with steam */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-gold/30 to-brand-700/40 border border-accent-gold/20 flex items-center justify-center backdrop-blur-sm">
                    <Coffee className="w-8 h-8 text-accent-gold-light" />
                  </div>
                  {/* Steam lines */}
                  <div className="absolute -top-2 left-3 flex gap-1.5">
                    <div
                      className="animate-steam w-[2px] h-5 rounded-full bg-brand-300/40"
                      style={{ animationDelay: "0s" }}
                    />
                    <div
                      className="animate-steam w-[2px] h-4 rounded-full bg-brand-400/30"
                      style={{ animationDelay: "0.8s" }}
                    />
                    <div
                      className="animate-steam w-[2px] h-5 rounded-full bg-brand-300/30"
                      style={{ animationDelay: "1.6s" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <h1
              className={`text-4xl xl:text-5xl font-light text-brand-100 leading-tight tracking-tight ${mounted ? "animate-login-rise" : "opacity-0"}`}
              style={{
                animationDelay: "0.45s",
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              Area
              <br />
              <span className="text-accent-gold font-normal">Amministrazione</span>
            </h1>

            <p
              className={`mt-5 text-brand-400 text-base leading-relaxed max-w-sm ${mounted ? "animate-login-rise" : "opacity-0"}`}
              style={{ animationDelay: "0.6s" }}
            >
              Gestisci prodotti, ordini e clienti dalla tua dashboard dedicata.
            </p>

            {/* Decorative line */}
            <div
              className={`mt-8 h-px w-24 bg-gradient-to-r from-accent-gold/60 to-transparent ${mounted ? "animate-login-fade" : "opacity-0"}`}
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          {/* Bottom — Footer */}
          <div
            className={`${mounted ? "animate-login-fade" : "opacity-0"}`}
            style={{ animationDelay: "1s" }}
          >
            <p className="text-brand-600 text-xs tracking-wider uppercase">
              Espressamente Coffee &middot; Dal cuore dell&apos;Italia
            </p>
          </div>
        </div>
      </div>

      {/* ── Form Panel (right) ── */}
      <div className="flex-1 flex items-center justify-center bg-brand-50 relative overflow-hidden px-6 py-12 lg:py-0">
        {/* Subtle background radial */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-200/30 blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent-gold/10 blur-[80px] translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo — shown only on small screens */}
          <div
            className={`lg:hidden text-center mb-10 ${mounted ? "animate-login-rise" : "opacity-0"}`}
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
            <p className="text-sm text-brand-500 mt-1">Area Amministrazione</p>
          </div>

          {/* Form card */}
          <div
            className={`${shakeError ? "animate-shake" : ""} ${mounted ? "animate-login-rise" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-brand-200/60 shadow-elevated p-8">
              {/* Form header */}
              <div className="mb-7">
                <h2
                  className="text-xl text-brand-900 font-medium tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Bentornato
                </h2>
                <p className="text-sm text-brand-500 mt-1">
                  Inserisci le tue credenziali per accedere
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div
                  className={`space-y-1.5 ${mounted ? "animate-login-rise" : "opacity-0"}`}
                  style={{ animationDelay: "0.35s" }}
                >
                  <Label htmlFor="username" className="text-brand-700 text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Il tuo username"
                    autoComplete="username"
                    className="h-11 bg-white/80 border-brand-200/80 focus-visible:bg-white"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div
                  className={`space-y-1.5 ${mounted ? "animate-login-rise" : "opacity-0"}`}
                  style={{ animationDelay: "0.45s" }}
                >
                  <Label htmlFor="password" className="text-brand-700 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="La tua password"
                      autoComplete="current-password"
                      className="h-11 bg-white/80 border-brand-200/80 focus-visible:bg-white pr-11"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end -mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-brand-500 hover:text-accent-gold transition-colors"
                  >
                    Password dimenticata?
                  </Link>
                </div>

                {/* Server error */}
                {serverError && (
                  <div className={`backdrop-blur-sm border rounded-xl p-3.5 animate-login-fade ${
                    serverError.includes("bloccato") || serverError.includes("Troppi")
                      ? "bg-amber-50/80 border-amber-300/60"
                      : "bg-red-50/80 border-red-200/60"
                  }`}>
                    <p className={`text-sm ${
                      serverError.includes("bloccato") || serverError.includes("Troppi")
                        ? "text-amber-800"
                        : "text-red-700"
                    }`}>{serverError}</p>
                  </div>
                )}

                {/* Submit */}
                <div
                  className={`pt-1 ${mounted ? "animate-login-rise" : "opacity-0"}`}
                  style={{ animationDelay: "0.55s" }}
                >
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm gap-2 group"
                    loading={isSubmitting}
                  >
                    Accedi
                    {!isSubmitting && (
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Secure connection badge */}
          <div
            className={`flex items-center justify-center gap-1.5 mt-6 ${mounted ? "animate-login-fade" : "opacity-0"}`}
            style={{ animationDelay: "0.8s" }}
          >
            <Lock className="w-3 h-3 text-brand-400" />
            <span className="text-xs text-brand-400">Connessione protetta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
