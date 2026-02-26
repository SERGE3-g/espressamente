"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { offers, type Offer } from "@/data/products";
import { MotionSection } from "@/components/ui/MotionWrapper";

interface OfferteBannerProps {
  /** Show only the first N offers */
  limit?: number;
  /** Full page section or compact widget */
  variant?: "section" | "compact";
}

export function OfferteBanner({
  limit = 2,
  variant = "section",
}: OfferteBannerProps) {
  const visibleOffers = offers.slice(0, limit);

  if (variant === "compact") {
    return <CompactBanner offer={visibleOffers[0]} />;
  }

  return (
    <MotionSection className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-brand-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 
                          px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Offerte in Corso
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-4">
            L&apos;Offerta Continua
          </h2>
          <p className="text-brand-600 max-w-xl mx-auto">
            Macchine espresso a prezzi imperdibili con capsule in omaggio.
            Passa in negozio o contattaci!
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {visibleOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/contatti"
            className="inline-flex items-center gap-2 bg-brand-800 text-white 
                       px-8 py-4 rounded-full text-lg font-semibold
                       hover:bg-brand-900 transition-all duration-300
                       hover:shadow-lg hover:shadow-brand-900/20 hover:-translate-y-0.5"
          >
            Contattaci per le Offerte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </MotionSection>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg 
                    hover:shadow-2xl transition-all duration-500 hover:-translate-y-1
                    border border-brand-100">
      {/* Image section */}
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <Image
          src={`${offer.image}-large.jpg`}
          alt={offer.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Badge */}
        {offer.badge && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold 
                             shadow-lg shadow-red-600/30">
              {offer.badge}
            </span>
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">
              {offer.price}€
            </span>
          </div>
          <p className="text-white/80 text-sm mt-1">{offer.brand}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-500 mb-2">
          {offer.subtitle}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-brand-900 mb-3">
          {offer.title}
        </h3>
        <p className="text-brand-600 text-sm leading-relaxed mb-4">
          {offer.description}
        </p>

        {/* Bonus badge */}
        {offer.bonus && (
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 
                          px-4 py-2 rounded-full text-sm font-medium border border-amber-200">
            <Gift className="w-4 h-4" />
            {offer.bonus}
          </div>
        )}
      </div>
    </div>
  );
}

function CompactBanner({ offer }: { offer: Offer }) {
  return (
    <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 
                    text-white px-4 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm sm:text-base font-medium">
            <span className="font-bold">{offer.subtitle}:</span>{" "}
            {offer.title} —{" "}
            <span className="text-amber-300 font-bold">{offer.price}€</span>
            {offer.bonus && (
              <span className="text-white/70"> + {offer.bonus}</span>
            )}
          </p>
        </div>
        <Link
          href="/contatti"
          className="text-sm font-semibold text-amber-300 hover:text-white 
                     transition-colors whitespace-nowrap flex items-center gap-1"
        >
          {offer.cta} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
