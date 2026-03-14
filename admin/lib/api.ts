import { logger } from "@/lib/logger";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ── Auth token (memory only — non persiste su refresh intenzionalmente) ──────
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (withAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const start = performance.now();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // manda cookie httpOnly (refresh token)
  });
  const duration = Math.round(performance.now() - start);
  logger.api(options?.method || "GET", endpoint, res.status, duration);

  if ((res.status === 401 || res.status === 403) && withAuth) {
    // Prova a refreshare il token
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      const retry = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
      if (retry.ok) return retry.json();
    }
    // Redirect a login
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Non autorizzato");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Errore API: ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.data?.accessToken) {
      accessToken = data.data.accessToken;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── API methods ───────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ──
  auth: {
    login: (username: string, password: string) =>
      fetchApi<AuthResponse>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),

    logout: () =>
      fetchApi<void>("/v1/auth/logout", { method: "POST" }, true),

    refresh: () =>
      fetchApi<AuthResponse>("/v1/auth/refresh", { method: "POST" }),

    forgotPassword: (email: string) =>
      fetchApi<{ success: boolean; message?: string }>("/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, newPassword: string) =>
      fetchApi<{ success: boolean; message?: string }>("/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
  },

  // ── Dashboard stats ──
  stats: {
    get: () =>
      fetchApi<{ success: boolean; data: DashboardStats }>("/v1/admin/stats", {}, true)
        .then((res) => res.data),
  },

  // ── Products ──
  products: {
    getAll: (page = 0, size = 20, type?: string) =>
      fetchApi<PagedResponse<Product>>(
        `/v1/products?page=${page}&size=${size}${type ? `&type=${type}` : ""}`,
        {}, true
      ),
    getBySlug: (slug: string) =>
      fetchApi<Product>(`/v1/products/${slug}`, {}, true),
    create: (data: unknown) =>
      fetchApi<Product>("/v1/admin/products", { method: "POST", body: JSON.stringify(data) }, true),
    update: (id: number, data: unknown) =>
      fetchApi<Product>(`/v1/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }, true),
    delete: (id: number) =>
      fetchApi<void>(`/v1/admin/products/${id}`, { method: "DELETE" }, true),
  },

  // ── Categories ──
  categories: {
    getAll: () => fetchApi<Category[]>("/v1/categories", {}, true),
    create: (data: { name: string; slug: string; sortOrder: number }) =>
      fetchApi<Category>("/v1/admin/categories", { method: "POST", body: JSON.stringify(data) }, true),
    update: (id: number, data: { name: string; slug: string; sortOrder: number }) =>
      fetchApi<Category>(`/v1/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }, true),
    delete: (id: number) =>
      fetchApi<void>(`/v1/admin/categories/${id}`, { method: "DELETE" }, true),
  },

  // ── Brands ──
  brands: {
    getAll: () => fetchApi<Brand[]>("/v1/brands", {}, true),
    create: (data: { name: string; slug: string; sortOrder: number }) =>
      fetchApi<Brand>("/v1/admin/brands", { method: "POST", body: JSON.stringify(data) }, true),
    update: (id: number, data: { name: string; slug: string; sortOrder: number }) =>
      fetchApi<Brand>(`/v1/admin/brands/${id}`, { method: "PUT", body: JSON.stringify(data) }, true),
    delete: (id: number) =>
      fetchApi<void>(`/v1/admin/brands/${id}`, { method: "DELETE" }, true),
  },

  // ── Pages CMS ──
  pages: {
    getAll: (search?: string, published?: boolean) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (published !== undefined) params.set("published", String(published));
      const qs = params.toString() ? `?${params.toString()}` : "";
      return fetchApi<{ success: boolean; data: CmsPage[] }>(`/v1/admin/pages${qs}`, {}, true)
        .then((res) => res.data);
    },
    getBySlug: (slug: string) => fetchApi<CmsPage>(`/v1/pages/${slug}`, {}, true),
    create: (data: { title: string; slug: string; content: string; isPublished: boolean; metaTitle?: string; metaDescription?: string }) =>
      fetchApi<CmsPage>("/v1/admin/pages", { method: "POST", body: JSON.stringify(data) }, true),
    update: (id: number, data: { title: string; slug: string; content: string; isPublished: boolean; metaTitle?: string; metaDescription?: string }) =>
      fetchApi<CmsPage>(`/v1/admin/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }, true),
    delete: (id: number) =>
      fetchApi<void>(`/v1/admin/pages/${id}`, { method: "DELETE" }, true),
  },

  // ── Customers (CRM) ──
  customers: {
    getAll: (page = 0, search?: string, clientType?: string, size = 20) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (search) params.set("search", search);
      if (clientType) params.set("clientType", clientType);
      return fetchApi<{ success: boolean; data: PagedResponse<Customer> }>(`/v1/admin/customers?${params}`, {}, true)
        .then((res) => res.data);
    },
    getById: (id: number) =>
      fetchApi<{ success: boolean; data: Customer }>(`/v1/admin/customers/${id}`, {}, true)
        .then((res) => res.data),
    create: (data: CustomerFormData) =>
      fetchApi<{ success: boolean; data: Customer }>("/v1/admin/customers", { method: "POST", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    update: (id: number, data: CustomerFormData) =>
      fetchApi<{ success: boolean; data: Customer }>(`/v1/admin/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    deactivate: (id: number) =>
      fetchApi<void>(`/v1/admin/customers/${id}`, { method: "DELETE" }, true),
    getComodato: (id: number) =>
      fetchApi<{ success: boolean; data: ComodatoRequest[] }>(`/v1/admin/customers/${id}/comodato`, {}, true)
        .then((res) => res.data),
    getContatti: (id: number) =>
      fetchApi<{ success: boolean; data: ContactRequest[] }>(`/v1/admin/customers/${id}/contatti`, {}, true)
        .then((res) => res.data),
    getAssistenza: (id: number) =>
      fetchApi<{ success: boolean; data: ServiceRequest[] }>(`/v1/admin/customers/${id}/assistenza`, {}, true)
        .then((res) => res.data),
  },

  // ── Customer Interactions ──
  customerInteractions: {
    getByCustomer: (customerId: number) =>
      fetchApi<{ success: boolean; data: CustomerInteraction[] }>(`/v1/admin/customers/${customerId}/interactions`, {}, true)
        .then((res) => res.data),
    create: (customerId: number, data: { type: string; subject: string; description: string; date?: string }) =>
      fetchApi<{ success: boolean; data: CustomerInteraction }>(`/v1/admin/customers/${customerId}/interactions`, { method: "POST", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    delete: (customerId: number, interactionId: number) =>
      fetchApi<void>(`/v1/admin/customers/${customerId}/interactions/${interactionId}`, { method: "DELETE" }, true),
  },

  // ── Invoices ──
  invoices: {
    getAll: (page = 0, status?: string, size = 20, search?: string, dateFrom?: string, dateTo?: string) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      return fetchApi<{ success: boolean; data: PagedResponse<InvoiceListItem> }>(`/v1/admin/invoices?${params}`, {}, true)
        .then((res) => res.data);
    },
    getById: (id: number) =>
      fetchApi<{ success: boolean; data: InvoiceDetail }>(`/v1/admin/invoices/${id}`, {}, true)
        .then((res) => res.data),
    create: (data: InvoiceFormData) =>
      fetchApi<{ success: boolean; data: InvoiceDetail }>("/v1/admin/invoices", { method: "POST", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    update: (id: number, data: InvoiceFormData) =>
      fetchApi<{ success: boolean; data: InvoiceDetail }>(`/v1/admin/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    updateStatus: (id: number, status: string) =>
      fetchApi<{ success: boolean; data: InvoiceDetail }>(
        `/v1/admin/invoices/${id}/status?status=${status}`,
        { method: "PATCH" }, true
      ).then((res) => res.data),
    delete: (id: number) =>
      fetchApi<void>(`/v1/admin/invoices/${id}`, { method: "DELETE" }, true),
    downloadPdf: (id: number) => {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return fetch(`${API_BASE}/v1/admin/invoices/${id}/pdf`, {
        headers,
        credentials: "include",
      }).then(async (res) => {
        if (!res.ok) throw new Error("Errore generazione PDF");
        return res.blob();
      });
    },
    sendEmail: (id: number) =>
      fetchApi<{ success: boolean; message: string }>(
        `/v1/admin/invoices/${id}/send-email`,
        { method: "POST" }, true
      ),
    exportCsv: (status?: string, search?: string, dateFrom?: string, dateTo?: string) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return fetch(`${API_BASE}/v1/admin/invoices/export/csv?${params}`, {
        headers,
        credentials: "include",
      }).then(async (res) => {
        if (!res.ok) throw new Error("Errore export CSV");
        return res.blob();
      });
    },
  },

  // ── Accounting ──
  accounting: {
    getAll: (page = 0, type?: string, size = 20, category?: string, search?: string, dateFrom?: string, dateTo?: string) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (type) params.set("type", type);
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      return fetchApi<{ success: boolean; data: PagedResponse<AccountingEntry> }>(`/v1/admin/accounting?${params}`, {}, true)
        .then((res) => res.data);
    },
    getSummary: (from?: string, to?: string, type?: string, category?: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (type) params.set("type", type);
      if (category) params.set("category", category);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return fetchApi<{ success: boolean; data: AccountingSummary }>(`/v1/admin/accounting/summary${qs}`, {}, true)
        .then((res) => res.data);
    },
    getProfitLoss: (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return fetchApi<{ success: boolean; data: ProfitAndLoss }>(`/v1/admin/accounting/profit-loss${qs}`, {}, true)
        .then((res) => res.data);
    },
    exportCsv: (type?: string, category?: string, search?: string, dateFrom?: string, dateTo?: string) => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return fetch(`${API_BASE}/v1/admin/accounting/export/csv?${params}`, {
        headers,
        credentials: "include",
      }).then(async (res) => {
        if (!res.ok) throw new Error("Errore export CSV");
        return res.blob();
      });
    },
    create: (data: AccountingFormData) =>
      fetchApi<{ success: boolean; data: AccountingEntry }>("/v1/admin/accounting", { method: "POST", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    update: (id: number, data: AccountingFormData) =>
      fetchApi<{ success: boolean; data: AccountingEntry }>(`/v1/admin/accounting/${id}`, { method: "PUT", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    delete: (id: number) =>
      fetchApi<void>(`/v1/admin/accounting/${id}`, { method: "DELETE" }, true),
  },

  // ── Upload ──
  upload: {
    image: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);
      const headers: Record<string, string> = {};
      const token = getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/v1/admin/upload`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload fallito");
      }
      const data = await res.json();
      return data.data.url as string;
    },
  },

  // ── Audit ──
  audit: {
    getAll: (page = 0, size = 20) =>
      fetchApi<{ success: boolean; data: PagedResponse<AuditLog> }>(`/v1/admin/audit?page=${page}&size=${size}`, {}, true)
        .then((res) => res.data),
  },

  // ── Users (employee management) ──
  users: {
    getAll: () =>
      fetchApi<{ success: boolean; data: AdminUserItem[] }>("/v1/admin/users", {}, true)
        .then((res) => res.data),
    getById: (id: number) =>
      fetchApi<{ success: boolean; data: AdminUserItem }>(`/v1/admin/users/${id}`, {}, true)
        .then((res) => res.data),
    create: (data: AdminUserFormData) =>
      fetchApi<{ success: boolean; data: AdminUserItem }>("/v1/admin/users", { method: "POST", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    update: (id: number, data: AdminUserFormData) =>
      fetchApi<{ success: boolean; data: AdminUserItem }>(`/v1/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    toggleActive: (id: number) =>
      fetchApi<void>(`/v1/admin/users/${id}/toggle-active`, { method: "PATCH" }, true),
    getStores: () =>
      fetchApi<{ success: boolean; data: StoreItem[] }>("/v1/admin/users/stores", {}, true)
        .then((res) => res.data),
  },

  // ── Warehouse ──
  warehouse: {
    getStock: () =>
      fetchApi<{ success: boolean; data: WarehouseStockItem[] }>("/v1/admin/warehouse/stock", {}, true)
        .then((res) => res.data),
    getLowStock: () =>
      fetchApi<{ success: boolean; data: WarehouseStockItem[] }>("/v1/admin/warehouse/low-stock", {}, true)
        .then((res) => res.data),
    adjustStock: (data: StockAdjustData) =>
      fetchApi<{ success: boolean; data: WarehouseStockItem }>("/v1/admin/warehouse/adjust", { method: "POST", body: JSON.stringify(data) }, true)
        .then((res) => res.data),
    getMovements: (page = 0, size = 20, productId?: number) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      if (productId) params.set("productId", String(productId));
      return fetchApi<{ success: boolean; data: PagedResponse<WarehouseMovement> }>(`/v1/admin/warehouse/movements?${params}`, {}, true)
        .then((res) => res.data);
    },
    importFile: async (file: File): Promise<ImportResult> => {
      const formData = new FormData();
      formData.append("file", file);
      const headers: Record<string, string> = {};
      const token = getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/v1/admin/warehouse/import`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Errore import");
      return data.data as ImportResult;
    },
  },

  // ── Settings ──
  settings: {
    changePassword: (oldPassword: string, newPassword: string) =>
      fetchApi<void>("/v1/admin/settings/password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      }, true),
  },

  // ── Contact requests ──
  contacts: {
    getAll: (page = 0, status?: string, size = 20) =>
      fetchApi<PagedResponse<ContactRequest>>(
        `/v1/admin/contacts?page=${page}&size=${size}${status ? `&status=${status}` : ""}`,
        {}, true
      ),
    updateStatus: (id: number, status: string) =>
      fetchApi<{ success: boolean; data: ContactRequest }>(
        `/v1/admin/contacts/${id}/status?status=${status}`,
        { method: "PATCH" }, true
      ).then((res) => res.data),
  },

  // ── Service requests ──
  services: {
    getAll: (page = 0, size = 20) =>
      fetchApi<PagedResponse<ServiceRequest>>(
        `/v1/admin/service-requests?page=${page}&size=${size}`,
        {}, true
      ),
    updateStatus: (id: number, status: string) =>
      fetchApi<{ success: boolean; data: ServiceRequest }>(
        `/v1/admin/service-requests/${id}/status?status=${status}`,
        { method: "PATCH" }, true
      ).then((res) => res.data),
  },

  // ── Comodato requests ──
  comodato: {
    getAll: (page = 0, status?: string, size = 20) =>
      fetchApi<PagedResponse<ComodatoRequest>>(
        `/v1/admin/comodato?page=${page}&size=${size}${status ? `&status=${status}` : ""}`,
        {}, true
      ),
    getById: (id: number) =>
      fetchApi<{ success: boolean; data: ComodatoRequest }>(
        `/v1/admin/comodato/${id}`, {}, true
      ).then((res) => res.data),
    updateStatus: (id: number, status: string, internalNotes?: string) =>
      fetchApi<{ success: boolean; data: ComodatoRequest }>(
        `/v1/admin/comodato/${id}/status?status=${status}${internalNotes ? `&internalNotes=${encodeURIComponent(internalNotes)}` : ""}`,
        { method: "PATCH" }, true
      ).then((res) => res.data),
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    username: string;
    fullName: string;
    email: string;
    role: string;
    storeId: number | null;
    storeName: string | null;
  };
  message?: string;
}

export interface DashboardStats {
  totalProducts: number;
  pendingContacts: number;
  pendingServices: number;
  pendingComodato: number;
  totalCustomers: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Product {
  id: number;
  sku: string | null;
  name: string;
  slug: string;
  shortDescription: string | null;
  productType: "CAFFE" | "MACCHINA" | "ACCESSORIO";
  price: number | null;
  priceLabel: string | null;
  isFeatured: boolean;
  isActive: boolean;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  images: string[];
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface ContactRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactType: string;
  status: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  machineBrand: string;
  machineModel: string;
  issueDescription: string;
  status: string;
  createdAt: string;
}

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  vatNumber: string | null;
  fiscalCode: string | null;
  clientType: "PRIVATO" | "AZIENDA";
  address: string | null;
  city: string | null;
  province: string | null;
  cap: string | null;
  country: string | null;
  notes: string | null;
  isActive: boolean;
  totalComodato: number;
  totalContatti: number;
  totalAssistenza: number;
  totalInteractions: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  vatNumber?: string;
  fiscalCode?: string;
  clientType: string;
  address?: string;
  city?: string;
  province?: string;
  cap?: string;
  country?: string;
  notes?: string;
}

export interface CustomerInteraction {
  id: number;
  type: string;
  subject: string | null;
  description: string | null;
  date: string;
  adminUsername: string | null;
  adminFullName: string | null;
  createdAt: string;
}

export interface ComodatoRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName: string | null;
  city: string;
  province: string | null;
  machineName: string | null;
  deliveryType: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
}

export interface InvoiceListItem {
  id: number;
  invoiceNumber: string;
  status: string;
  paymentMethod: string | null;
  issueDate: string;
  dueDate: string | null;
  total: number;
  customer: { id: number; fullName: string; companyName: string | null } | null;
  createdAt: string;
}

export interface InvoiceDetail extends InvoiceListItem {
  paidDate: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  notes: string | null;
  customer: { id: number; fullName: string; email: string; companyName: string | null; vatNumber: string | null } | null;
  items: InvoiceItemDetail[];
  updatedAt: string;
}

export interface InvoiceItemDetail {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productId: number | null;
}

export interface InvoiceFormData {
  customerId?: number;
  paymentMethod?: string;
  issueDate?: string;
  dueDate?: string;
  taxRate: number;
  notes?: string;
  items: { productId?: number; description: string; quantity: number; unitPrice: number }[];
}

export interface AccountingEntry {
  id: number;
  type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  invoiceId: number | null;
  invoiceNumber: string | null;
  customerId: number | null;
  customerName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountingSummary {
  totalEntrate: number;
  totalUscite: number;
  bilancio: number;
  periodFrom: string;
  periodTo: string;
}

export interface AuditLog {
  id: number;
  adminUsername: string;
  action: string;
  entityType: string | null;
  entityId: number | null;
  description: string | null;
  createdAt: string;
}

export interface ProfitAndLoss {
  categories: { category: string; entrate: number; uscite: number; netto: number }[];
  totalEntrate: number;
  totalUscite: number;
  netResult: number;
  periodFrom: string;
  periodTo: string;
}

export interface AccountingFormData {
  type: string;
  category: string;
  amount: number;
  description: string;
  date?: string;
  invoiceId?: number;
  customerId?: number;
  notes?: string;
}

export interface AdminUserItem {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  storeId: number | null;
  storeName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserFormData {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  role: string;
  storeId?: number | null;
}

export interface WarehouseStockItem {
  id: number;
  productId: number;
  productSku: string | null;
  productName: string;
  productType: string;
  storeId: number | null;
  storeName: string | null;
  quantity: number;
  reorderPoint: number;
  lowStock: boolean;
}

export interface WarehouseMovement {
  id: number;
  productId: number;
  productName: string;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: string | null;
  referenceId: number | null;
  notes: string | null;
  adminUsername: string | null;
  createdAt: string;
}

export interface ImportResult {
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface StockAdjustData {
  productId: number;
  storeId?: number;
  movementType: string;
  quantity: number;
  reorderPoint?: number;
  notes?: string;
}

export interface StoreItem {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}
