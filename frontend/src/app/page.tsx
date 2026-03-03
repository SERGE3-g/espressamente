import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { AssistenzaBanner } from "@/components/sections/AssistenzaBanner";
import { BrandsSection } from "@/components/sections/BrandsSection";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, brands] = await Promise.all([
    api.products.getFeatured(),
    api.categories.getAll(),
    api.brands.getAll(),
  ]);

  return (
    <>
      <HeroSection />

      <CategoriesSection categories={categories} />

      <FeaturedProducts products={featured} />

      <AssistenzaBanner />

      <BrandsSection brands={brands} />
    </>
  );
}
