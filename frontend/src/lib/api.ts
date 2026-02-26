import type {
  Product,
  Category,
  Brand,
  PageContent,
  PagedResponse,
  ApiResponse,
  ContactFormData,
  ServiceFormData,
  ProductType,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // ── Products ──
  products: {
    getAll: (page = 0, size = 12, type?: ProductType, sort?: string) =>
      fetchApi<PagedResponse<Product>>(
        `/v1/products?page=${page}&size=${size}${type ? `&type=${type}` : ""}${sort ? `&sort=${sort}` : ""}`
      ),

    getBySlug: (slug: string) =>
      fetchApi<Product>(`/v1/products/${slug}`),

    getFeatured: () =>
      fetchApi<Product[]>("/v1/products/featured"),

    getByCategory: (categorySlug: string, page = 0, size = 12, sort?: string) =>
      fetchApi<PagedResponse<Product>>(
        `/v1/products/by-category/${categorySlug}?page=${page}&size=${size}${sort ? `&sort=${sort}` : ""}`
      ),

    getByBrand: (brandSlug: string, page = 0, size = 12, sort?: string) =>
      fetchApi<PagedResponse<Product>>(
        `/v1/products/by-brand/${brandSlug}?page=${page}&size=${size}${sort ? `&sort=${sort}` : ""}`
      ),

    search: (query: string, page = 0, size = 12, sort?: string) =>
      fetchApi<PagedResponse<Product>>(
        `/v1/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}${sort ? `&sort=${sort}` : ""}`
      ),
  },

  // ── Categories ──
  categories: {
    getAll: () => fetchApi<Category[]>("/v1/categories"),
  },

  // ── Brands ──
  brands: {
    getAll: () => fetchApi<Brand[]>("/v1/brands"),
    getBySlug: (slug: string) => fetchApi<Brand>(`/v1/brands/${slug}`),
  },

  // ── Pages ──
  pages: {
    getBySlug: (slug: string) => fetchApi<PageContent>(`/v1/pages/${slug}`),
  },

  // ── Contact ──
  contact: {
    submit: (data: ContactFormData) =>
      fetchApi<ApiResponse<void>>("/v1/contact", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // ── Service Request ──
  service: {
    submit: (data: ServiceFormData) =>
      fetchApi<ApiResponse<void>>("/v1/service-request", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
