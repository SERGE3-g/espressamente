import type { Brand } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { MotionSection, MotionStaggerParent, MotionChild } from "@/components/ui/MotionWrapper";

interface Props {
  brands: Brand[];
}

export function BrandsSection({ brands }: Props) {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <MotionSection className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 heading-decorated-center">
          I Nostri Brand
        </h2>
      </MotionSection>

      <MotionStaggerParent className="flex flex-wrap justify-center items-center gap-10 md:gap-14">
        {brands.map((brand) => (
          <MotionChild key={brand.id}>
            <Link
              href={`/brand/${brand.slug}`}
              className="grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-400 hover:scale-110"
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="object-contain"
                />
              ) : (
                <span className="text-lg font-heading font-semibold text-brand-600 px-4 py-2">
                  {brand.name}
                </span>
              )}
            </Link>
          </MotionChild>
        ))}
      </MotionStaggerParent>
    </section>
  );
}
