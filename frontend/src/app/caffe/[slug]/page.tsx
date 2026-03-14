import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Coffee } from "lucide-react";

export const revalidate = 60;
import { api } from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await api.products.getBySlug(slug);
    return {
      title: product.metaTitle || `${product.name} — Espressamente`,
      description: product.metaDescription || product.shortDescription || undefined,
    };
  } catch {
    return { title: "Prodotto — Espressamente" };
  }
}

export default async function CaffeDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await api.products.getBySlug(slug);
  } catch {
    notFound();
  }

  if (product.productType !== "CAFFE") notFound();

  const image = product.images?.[0];
  const price = product.price
    ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(product.price)
    : product.priceLabel;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/caffe"
        className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-800 mb-8 text-sm font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Torna ai caffè
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Immagine */}
        <div className="aspect-square bg-brand-50 rounded-2xl overflow-hidden relative group border border-brand-100">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Coffee className="w-20 h-20 text-brand-200" />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && (
            <p className="text-xs text-brand-400 font-medium uppercase tracking-[0.15em] mb-2">
              {product.brand.name}
            </p>
          )}
          {product.category && (
            <p className="text-xs text-brand-300 mb-3">{product.category.name}</p>
          )}
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 mb-4 leading-tight">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="text-brand-600 text-lg mb-6 leading-relaxed">{product.shortDescription}</p>
          )}

          {price && (
            <div className="mb-8">
              <span className="inline-block bg-brand-50 border border-brand-100 text-brand-900 font-bold text-xl px-5 py-2.5 rounded-xl">
                {price}
              </span>
            </div>
          )}

          {product.features && product.features.length > 0 && (
            <div className="mb-8">
              <h2 className="font-semibold text-brand-900 mb-4 text-sm uppercase tracking-wider">
                Caratteristiche
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((f) => (
                  <div
                    key={f.label}
                    className="bg-brand-50/60 border border-brand-100 rounded-xl px-4 py-3"
                  >
                    <p className="text-xs text-brand-400 mb-0.5">{f.label}</p>
                    <p className="text-sm text-brand-800 font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div
              className="prose-brand"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          <div className="mt-10 pt-6 border-t border-brand-100">
            <Link
              href="/contatti"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-400/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              Richiedi informazioni
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
