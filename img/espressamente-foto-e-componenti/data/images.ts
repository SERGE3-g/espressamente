/**
 * Espressamente — Image Catalog
 * Manifest tipizzato di tutte le foto ottimizzate del negozio.
 * Ogni immagine ha 3 dimensioni: large (1920px), medium (800px), thumbnail (400px)
 * 
 * Percorso base: /images/espressamente/
 * Struttura: /images/espressamente/{category}/{name}-{size}.jpg
 */

export type ImageSize = "large" | "medium" | "thumbnail";

export interface SiteImage {
  name: string;
  category: "brand" | "negozio" | "prodotti" | "offerte";
  alt: string;
  use: string[];
  src: (size: ImageSize) => string;
}

const BASE_PATH = "/images/espressamente";

function createImage(
  name: string,
  category: SiteImage["category"],
  alt: string,
  use: string[]
): SiteImage {
  return {
    name,
    category,
    alt,
    use,
    src: (size: ImageSize) => `${BASE_PATH}/${category}/${name}-${size}.jpg`,
  };
}

// ── Brand / Biglietti da visita ──
export const bigliettiFronte = createImage(
  "biglietto-fronte",
  "brand",
  "Biglietto Espressamente Coffee — Concessionario illy e Mokador",
  ["chi-siamo"]
);

export const bigliettiRetro = createImage(
  "biglietto-retro",
  "brand",
  "Biglietto da visita Espressamente — contatti e sedi Formia e Minturno",
  ["contatti", "chi-siamo"]
);

// ── Negozio ──
export const negozioPanoramica = createImage(
  "negozio-panoramica",
  "negozio",
  "Interno del negozio Espressamente Coffee — bancone e scaffali prodotti",
  ["hero", "chi-siamo", "gallery"]
);

export const negozioBancone = createImage(
  "negozio-bancone",
  "negozio",
  "Bancone Espressamente con prodotti Caffè Borbone e Kimbo",
  ["chi-siamo", "gallery"]
);

export const negozioScaffali = createImage(
  "negozio-scaffali-mokador",
  "negozio",
  "Scaffali con capsule Mokador DIVA e Caffè d'Italia",
  ["gallery", "prodotti"]
);

export const negozioVetrina = createImage(
  "negozio-vetrina",
  "negozio",
  "Vetrina e ingresso negozio Espressamente Coffee con offerte in evidenza",
  ["hero", "chi-siamo", "gallery"]
);

// ── Prodotti ──
export const capsuleKimbo = createImage(
  "capsule-kimbo-pompei",
  "prodotti",
  "Capsule Kimbo Pompei 100 pezzi — compatibili Lavazza A Modo Mio — Intensità 12/13",
  ["prodotti", "gallery"]
);

export const cialdeBiancaffe = createImage(
  "cialde-biancaffe-arabica",
  "prodotti",
  "Cialde ESE Biancaffè Arabica 50 pezzi — con Zicaffè e Caffè Borbone",
  ["prodotti", "gallery"]
);

// ── Offerte ──
export const offertaEspresso = createImage(
  "offerta-espresso-39euro",
  "offerte",
  "Offerta macchina espresso Caffè d'Italia a 39€ con kit degustazione in omaggio",
  ["offerte", "home", "banner"]
);

// ── Collections ──
export const allImages: SiteImage[] = [
  bigliettiFronte,
  bigliettiRetro,
  negozioPanoramica,
  negozioBancone,
  negozioScaffali,
  negozioVetrina,
  capsuleKimbo,
  cialdeBiancaffe,
  offertaEspresso,
];

export const galleryImages = allImages.filter((img) =>
  img.use.includes("gallery")
);

export const heroImages = allImages.filter((img) =>
  img.use.includes("hero")
);

export const productImages = allImages.filter((img) =>
  img.use.includes("prodotti")
);

export const offerImages = allImages.filter((img) =>
  img.use.includes("offerte") || img.use.includes("banner")
);
