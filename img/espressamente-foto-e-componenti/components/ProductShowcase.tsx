"use client";

import Image from "next/image";
import { ShoppingBag, Star, Phone } from "lucide-react";
import { products, type Product } from "@/data/products";
import { MotionSection } from "@/components/ui/MotionWrapper";

interface ProductShowcaseProps {
  title?: string;
  subtitle?: string;
  items?: Product[];
  showAll?: boolean;
}

export function ProductShowcase({
  title = "I Nostri Caffè",
  subtitle = "Selezione di caffè premium dai migliori torrefattori italiani.",
  items,
  showAll = false,
}: ProductShowcaseProps) {
  const displayProducts = items || (showAll ? products : products.slice(0, 4));

  return (
    <MotionSection className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-4">
            {title}
          </h2>
          <p className="text-brand-600 max-w-xl mx-auto">{subtitle}</p>
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

function ProductCard({ product }: { product: Product }) {
  const pricePerUnit =
    product.quantity && product.quantity > 0
      ? (product.price / product.quantity).toFixed(2)
      : null;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-brand-100
                    shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1
                    flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        <Image
          src={`${product.image}-medium.jpg`}
          alt={`${product.brand} ${product.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span
              className="bg-brand-800 text-white px-3 py-1 rounded-full text-xs font-semibold
                             shadow-md"
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Intensity indicator */}
        {product.intensity && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-amber-400">●</span> {product.intensity}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Brand */}
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
          {product.brand}
        </p>

        {/* Name */}
        <h3 className="text-lg font-bold text-brand-900 mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-brand-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Details */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.compatibility && (
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-md">
              {product.compatibility}
            </span>
          )}
          {product.quantity && (
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-md">
              {product.quantity} pz
            </span>
          )}
          {product.roast && (
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-md">
              Tostatura {product.roast}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-brand-50">
          <div>
            <span className="text-2xl font-black text-brand-900">
              €{product.price.toFixed(2)}
            </span>
            {pricePerUnit && (
              <p className="text-xs text-brand-400 mt-0.5">
                €{pricePerUnit}/pz
              </p>
            )}
          </div>
          <a
            href="tel:+390771010221"
            className="inline-flex items-center gap-1.5 bg-brand-800 text-white 
                       px-4 py-2.5 rounded-xl text-sm font-semibold
                       hover:bg-brand-900 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Ordina
          </a>
        </div>
      </div>
    </div>
  );
}
