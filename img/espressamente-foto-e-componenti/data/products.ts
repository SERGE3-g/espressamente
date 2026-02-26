/**
 * Espressamente — Dati Prodotti reali dal negozio
 * Prezzi e dettagli estratti dalle foto dello store
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  type: "capsule" | "cialda" | "macchina" | "accessorio";
  compatibility?: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
  intensity?: string;
  roast?: string;
  image: string;
  imageSrcSet?: string;
  badge?: string;
  inStock: boolean;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  bonus?: string;
  brand: string;
  image: string;
  badge?: string;
  cta: string;
  validUntil?: string;
}

// ── Prodotti dal negozio ──
export const products: Product[] = [
  {
    id: "kimbo-pompei-100",
    name: "Pompei",
    brand: "Kimbo",
    type: "capsule",
    compatibility: "Lavazza A Modo Mio",
    description:
      "Il Caffè di Napoli — Tostatura scura con il talento napoletano della tostatura. 100 capsule compatibili.",
    price: 23.0,
    quantity: 100,
    intensity: "12/13",
    roast: "Scura",
    image: "/images/espressamente/prodotti/capsule-kimbo-pompei",
    badge: "Italian Quality",
    inStock: true,
  },
  {
    id: "biancaffe-arabica-50",
    name: "Arabica — Cialde ESE",
    brand: "Biancaffè",
    type: "cialda",
    compatibility: "ESE 44mm",
    description:
      "Italiano dal 1932 — Un viaggio nel gusto. 50 cialde ESE 100% Arabica.",
    price: 12.0,
    quantity: 50,
    image: "/images/espressamente/prodotti/cialde-biancaffe-arabica",
    badge: "Arabica 100%",
    inStock: true,
  },
  {
    id: "borbone-compostabile-50",
    name: "Cialda Compostabile",
    brand: "Caffè Borbone",
    type: "cialda",
    compatibility: "ESE 44mm",
    description: "Caffè Borbone Napoli — Cialde compostabili in carta filtro.",
    price: 11.5,
    quantity: 50,
    image: "/images/espressamente/prodotti/cialde-biancaffe-arabica",
    inStock: true,
  },
  {
    id: "zicaffe-gustosa-cialde",
    name: "Gustosa",
    brand: "Zicaffè",
    type: "cialda",
    compatibility: "ESE 44mm",
    description:
      "Industria di torrefazione dal 1929 — Miscela di caffè torrefatto monoporzionato.",
    price: 17.0,
    quantity: 50,
    image: "/images/espressamente/prodotti/cialde-biancaffe-arabica",
    inStock: true,
  },
];

// ── Offerte attive ──
export const offers: Offer[] = [
  {
    id: "offer-caffe-italia-39",
    title: "Il Tuo Espresso a 39€",
    subtitle: "L'Offerta Continua",
    description:
      "Macchina espresso Caffè d'Italia disponibile in 3 colori. Kit degustazione in omaggio!",
    price: 39,
    brand: "Caffè d'Italia",
    image: "/images/espressamente/offerte/offerta-espresso-39euro",
    bonus: "Kit Degustazione in Omaggio",
    badge: "PROMO",
    cta: "Scopri l'offerta",
  },
  {
    id: "offer-mokador-49",
    title: "Mokador da 49€",
    subtitle: "L'Offerta Continua",
    description:
      "Macchine Mokador 100% Straordinario a partire da 49€. Con 50 capsule in omaggio!",
    price: 49,
    brand: "Mokador",
    image: "/images/espressamente/negozio/negozio-vetrina",
    bonus: "50 Capsule in Omaggio",
    badge: "DA 49€",
    cta: "Vedi le macchine",
  },
  {
    id: "offer-mokador-59",
    title: "Mokador Premium",
    subtitle: "L'Offerta Continua",
    description: "Modello intermedio Mokador con 50 capsule in omaggio.",
    price: 59,
    brand: "Mokador",
    image: "/images/espressamente/negozio/negozio-vetrina",
    bonus: "50 Capsule in Omaggio",
    cta: "Vedi le macchine",
  },
  {
    id: "offer-mokador-69",
    title: "Mokador Top",
    subtitle: "L'Offerta Continua",
    description:
      "Modello top di gamma Mokador con 50 capsule in omaggio.",
    price: 69,
    brand: "Mokador",
    image: "/images/espressamente/negozio/negozio-vetrina",
    bonus: "50 Capsule in Omaggio",
    cta: "Vedi le macchine",
  },
];

// ── Brand distribuiti ──
export const brands = [
  { name: "illy", role: "Concessionario di zona", logo: "/images/brands/illy.svg" },
  { name: "Mokador", role: "Concessionario di zona", logo: "/images/brands/mokador.svg" },
  { name: "Kimbo", role: "Rivenditore", logo: "/images/brands/kimbo.svg" },
  { name: "Caffè Borbone", role: "Rivenditore", logo: "/images/brands/borbone.svg" },
  { name: "Biancaffè", role: "Rivenditore", logo: "/images/brands/biancaffe.svg" },
  { name: "Zicaffè", role: "Rivenditore", logo: "/images/brands/zicaffe.svg" },
  { name: "Caffè d'Italia", role: "Rivenditore", logo: "/images/brands/caffe-italia.svg" },
  { name: "Didiesse", role: "Rivenditore macchine", logo: "/images/brands/didiesse.svg" },
] as const;

// ── Macchine visibili nello store ──
export const machines = [
  {
    name: "Pepita",
    brand: "Caffè d'Italia",
    type: "Capsule monodose",
    collection: "Momenti d'Oro",
  },
  {
    name: "Frog",
    brand: "Didiesse",
    type: "Cialde ESE",
    description: "Una garanzia di affidabilità — comoda da tenere sempre con te",
  },
  {
    name: "Baby Frog",
    brand: "Didiesse",
    type: "Cialde ESE",
    description: "L'espresso di nuova generazione — Coffee & Tea",
  },
  {
    name: "DIVA M1",
    brand: "Mokador",
    type: "Capsule Mokador",
  },
] as const;
