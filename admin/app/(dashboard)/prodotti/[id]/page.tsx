"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, Product } from "@/lib/api";
import { ArrowLeft, PackageX } from "lucide-react";
import { ProductForm } from "@/components/products/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function ModificaProdottoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products
      .getAll(0, 200)
      .then((res) => {
        const found = res.content.find((p) => p.id === Number(id));
        setProduct(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl space-y-6">
        <div>
          <Skeleton className="h-5 w-40 bg-brand-100/60 mb-4" />
          <Skeleton className="h-8 w-64 bg-brand-100/60" />
          <Skeleton className="h-4 w-48 bg-brand-100/60 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 bg-brand-100/60 rounded-xl" />
            <Skeleton className="h-40 bg-brand-100/60 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 bg-brand-100/60 rounded-xl" />
            <Skeleton className="h-32 bg-brand-100/60 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl">
        <EmptyState
          icon={PackageX}
          title="Prodotto non trovato"
          description="Il prodotto richiesto non esiste o e stato eliminato."
          action={
            <Link href="/prodotti">
              <Button variant="outline">Torna ai prodotti</Button>
            </Link>
          }
        />
      </div>
    );
  }

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
          Modifica: {product.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Aggiorna le informazioni del prodotto.
        </p>
      </div>

      {/* Form */}
      <ProductForm
        product={product}
        onSuccess={() => router.push("/prodotti")}
        onCancel={() => router.push("/prodotti")}
      />
    </div>
  );
}
