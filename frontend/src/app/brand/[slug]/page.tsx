import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/products/ProductGrid";
import { MotionSection } from "@/components/ui/MotionWrapper";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const brand = await api.brands.getBySlug(slug);
    return {
      title: `${brand.name} — Espressamente`,
      description: brand.description || `Scopri i prodotti ${brand.name} su Espressamente.`,
    };
  } catch {
    return { title: "Brand — Espressamente" };
  }
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page || "0");

  let brand;
  try {
    brand = await api.brands.getBySlug(slug);
  } catch {
    notFound();
  }

  const productsData = await api.products.getByBrand(slug, page, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/macchine"
        className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-800 mb-8 text-sm font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Torna alle macchine
      </Link>

      {/* Brand header */}
      <MotionSection>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12 pb-10 border-b border-brand-100">
          {brand.logo && (
            <div className="relative w-24 h-24 flex-shrink-0 bg-brand-50 rounded-2xl border border-brand-100 p-3">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            </div>
          )}
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 mb-2">
              {brand.name}
            </h1>
            {brand.description && (
              <p className="text-brand-600 max-w-2xl leading-relaxed">{brand.description}</p>
            )}
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-500 hover:text-brand-800 transition-colors font-medium"
              >
                Sito ufficiale <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </MotionSection>

      {/* Products */}
      <MotionSection delay={0.2}>
        <div>
          <h2 className="font-heading text-xl font-bold text-brand-900 mb-6 heading-decorated">
            Prodotti {brand.name}
          </h2>
          <ProductGrid products={productsData.content} />
        </div>
      </MotionSection>
    </div>
  );
}
