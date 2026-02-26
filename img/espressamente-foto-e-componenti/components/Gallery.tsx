"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { galleryImages, type SiteImage } from "@/data/images";
import { MotionSection } from "@/components/ui/MotionWrapper";

interface GalleryProps {
  images?: SiteImage[];
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
}

export function Gallery({
  images = galleryImages,
  title = "Il Nostro Negozio",
  subtitle = "Scopri il mondo Espressamente — caffè di qualità, macchine professionali e tanta passione.",
  columns = 3,
}: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  }, [lightboxIndex, images.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + images.length) % images.length
      );
    }
  }, [lightboxIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <>
      <MotionSection className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-4">
              {title}
            </h2>
            <p className="text-brand-600 max-w-2xl mx-auto text-lg">
              {subtitle}
            </p>
          </div>

          {/* Grid */}
          <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
            {images.map((img, index) => (
              <button
                key={img.name}
                onClick={() => openLightbox(index)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-100 
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/50
                           transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <Image
                  src={img.src("medium")}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-transparent to-transparent 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <p className="text-white text-sm sm:text-base font-medium line-clamp-2">
                      {img.alt}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm 
                                    flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 
                       backdrop-blur-sm flex items-center justify-center 
                       hover:bg-white/20 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 
                       backdrop-blur-sm flex items-center justify-center 
                       hover:bg-white/20 transition-colors"
            aria-label="Precedente"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 
                       backdrop-blur-sm flex items-center justify-center 
                       hover:bg-white/20 transition-colors"
            aria-label="Successivo"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].src("large")}
              alt={images[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Caption + Counter */}
          <div className="absolute bottom-6 left-0 right-0 text-center px-4">
            <p className="text-white/90 text-sm sm:text-base mb-2">
              {images[lightboxIndex].alt}
            </p>
            <p className="text-white/50 text-xs">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
