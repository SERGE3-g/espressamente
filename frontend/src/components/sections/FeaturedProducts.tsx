import type { Product } from "@/types";
import Link from "next/link";
import { MotionSection } from "@/components/ui/MotionWrapper";
import { ProductCarousel } from "@/components/sections/ProductCarousel";

interface Props {
  products: Product[];
}

export function FeaturedProducts({ products }: Props) {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <MotionSection className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 heading-decorated-center">
          In Evidenza
        </h2>
      </MotionSection>

      <ProductCarousel products={products} />

      <MotionSection delay={0.3} className="text-center mt-10">
        <Link
          href="/caffe"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 font-medium transition-colors group"
        >
          Vedi tutti i prodotti
          <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>
      </MotionSection>
    </section>
  );
}
