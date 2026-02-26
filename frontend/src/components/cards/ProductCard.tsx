import type { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Coffee } from "lucide-react";

interface Props {
  product: Product;
}

const typeRoute: Record<string, string> = {
  CAFFE: "caffe",
  MACCHINA: "macchine",
  ACCESSORIO: "macchine",
};

export function ProductCard({ product }: Props) {
  const route = typeRoute[product.productType] || "caffe";
  const image = product.images?.[0];

  return (
    <Link
      href={`/${route}/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-[var(--shadow-card-soft)] hover:shadow-[var(--shadow-card-soft-hover)] transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image — 3:4 portrait ratio, cream background */}
      <div className="aspect-[3/4] bg-[var(--color-cream)] relative overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Coffee className="w-12 h-12 text-brand-200" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        {product.brand && (
          <p className="text-[11px] text-brand-400 font-medium uppercase tracking-[0.15em] mb-1">
            {product.brand.name}
          </p>
        )}
        <h3 className="font-heading text-base font-semibold text-brand-900 leading-snug line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Price — clean typography */}
        {product.price ? (
          <p className="text-brand-800 font-bold text-[15px]">
            {new Intl.NumberFormat("it-IT", {
              style: "currency",
              currency: "EUR",
            }).format(product.price)}
          </p>
        ) : product.priceLabel ? (
          <p className="text-sm text-brand-400 italic">{product.priceLabel}</p>
        ) : null}

        {/* Subtle CTA */}
        <p className="mt-3 text-xs font-medium text-brand-400 group-hover:text-brand-700 transition-colors tracking-wide uppercase">
          Scopri di più
          <span className="inline-block ml-1 group-hover:translate-x-0.5 transition-transform">
            &rarr;
          </span>
        </p>
      </div>
    </Link>
  );
}
