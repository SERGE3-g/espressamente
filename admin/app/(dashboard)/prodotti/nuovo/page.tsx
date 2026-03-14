"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/products/ProductForm";

export default function NuovoProdottoPage() {
  const router = useRouter();

  return (
    <div className="max-w-5xl space-y-6">
      {/* Back link + title */}
      <div>
        <Link
          href="/prodotti"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna ai prodotti
        </Link>
        <h1 className="text-2xl font-semibold text-brand-900">
          Nuovo prodotto
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Compila i campi per aggiungere un nuovo prodotto al catalogo.
        </p>
      </div>

      {/* Form */}
      <ProductForm
        onSuccess={() => router.push("/prodotti")}
        onCancel={() => router.push("/prodotti")}
      />
    </div>
  );
}
