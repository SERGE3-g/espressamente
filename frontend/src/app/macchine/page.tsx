import type { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FilterBar } from "@/components/products/FilterBar";

export const revalidate = 60;
import { SortDropdown } from "@/components/products/SortDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Macchine — Espressamente",
  description: "Macchine da caffè professionali e domestiche dei migliori brand.",
};

interface PageProps {
  searchParams: Promise<{ brand?: string; page?: string; sort?: string }>;
}

async function MacchineContent({
  brand,
  page,
  sort,
}: {
  brand: string;
  page: number;
  sort: string;
}) {
  const data = brand
    ? await api.products.getByBrand(brand, page, 12, sort || undefined)
    : await api.products.getAll(page, 12, "MACCHINA", sort || undefined);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm text-brand-400">
          {data.totalElements} {data.totalElements === 1 ? "prodotto" : "prodotti"}
        </span>
        <SortDropdown />
      </div>
      <ProductGrid products={data.content} />
      <Pagination totalPages={data.totalPages} currentPage={data.number} />
    </>
  );
}

function GridSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="h-5 w-24 bg-brand-100 rounded animate-pulse" />
        <div className="h-10 w-40 bg-brand-100 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default async function MacchinePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const brand = params.brand || "";
  const page = Number(params.page || "0");
  const sort = params.sort || "";

  const brands = await api.brands.getAll();

  const filterOptions = brands.map((b) => ({
    label: b.name,
    value: b.slug,
  }));

  return (
    <>
      {/* Compact page hero */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Macchine da Caffè</h1>
          <p className="text-brand-300 text-base max-w-xl">
            Professionali, domestiche e semi-professionali dei migliori brand al mondo.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter tabs */}
        <div className="mb-6 border-b border-brand-100">
          <FilterBar options={filterOptions} paramName="brand" label="Brand" />
        </div>

        <Suspense fallback={<GridSkeleton />}>
          <MacchineContent brand={brand} page={page} sort={sort} />
        </Suspense>
      </div>
    </>
  );
}
