// ── Product Types ──

export type ProductType = "CAFFE" | "MACCHINA" | "ACCESSORIO";

export interface ProductFeature {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  productType: ProductType;
  price: number | null;
  priceLabel: string | null;
  category: Category | null;
  brand: Brand | null;
  images: string[];
  features: ProductFeature[];
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
}

// ── Category Types ──

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  sortOrder: number;
}

// ── Brand Types ──

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
}

// ── Contact Types ──

export type ContactType = "INFO" | "PREVENTIVO" | "ASSISTENZA" | "ALTRO";

export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  subject?: string;
  message: string;
  contactType: ContactType;
  privacyConsent: boolean;
}

export interface ServiceFormData {
  fullName: string;
  email: string;
  phone?: string;
  machineType?: string;
  machineBrand?: string;
  machineModel?: string;
  issueDescription: string;
  preferredDate?: string;
}

export type DeliveryType = "CONSEGNA" | "RITIRO";

export interface ComodatoFormData {
  clientType: "PRIVATO" | "AZIENDA";
  vatNumber?: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  address?: string;
  city: string;
  province?: string;
  machineId?: number;
  machineName?: string;
  deliveryType: DeliveryType;
  notes?: string;
  privacyConsent: boolean;
}

// ── API Types ──

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ── Page Types ──

export interface PageContent {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
}
