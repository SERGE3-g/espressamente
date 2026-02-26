import type { Product } from "@/types";
import { ProductCard } from "@/components/cards/ProductCard";

interface Props {
  products: Product[];
}

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-brand-400">
        <p className="text-lg font-heading">Nessun prodotto trovato.</p>
        <p className="text-sm mt-2">Prova a modificare i filtri di ricerca.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
