import type { Category } from "@/types";
import Link from "next/link";
import { MotionSection, MotionStaggerParent, MotionChild } from "@/components/ui/MotionWrapper";

interface Props {
  categories: Category[];
}

export function CategoriesSection({ categories }: Props) {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <MotionSection className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 heading-decorated-center">
          Le Nostre Categorie
        </h2>
      </MotionSection>

      <MotionStaggerParent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <MotionChild key={cat.id}>
            <Link
              href={`/caffe?categoria=${cat.slug}`}
              className="group block bg-white rounded-xl overflow-hidden shadow-[var(--shadow-card-soft)] hover:shadow-[var(--shadow-card-soft-hover)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="bg-[var(--color-cream)] py-8 flex items-center justify-center">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  ☕
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-brand-800 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm text-brand-400 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-brand-400 group-hover:text-brand-600 transition-colors uppercase tracking-wide">
                  Esplora{" "}
                  <span className="inline-block ml-0.5 group-hover:translate-x-0.5 transition-transform">
                    &rarr;
                  </span>
                </p>
              </div>
            </Link>
          </MotionChild>
        ))}
      </MotionStaggerParent>
    </section>
  );
}
