"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, Customer } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import { Pagination } from "@/components/shared/Pagination";
import { Plus, Users, Search } from "lucide-react";

const TYPE_FILTERS = [
  { label: "Tutti", value: "" },
  { label: "Privato", value: "PRIVATO" },
  { label: "Azienda", value: "AZIENDA" },
];

export default function ClientiPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadCustomers = useCallback(() => {
    setLoading(true);
    api.customers
      .getAll(page, search || undefined, typeFilter || undefined, pageSize)
      .then((res) => {
        setCustomers(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(() => toast({ title: "Errore nel caricamento clienti", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, pageSize, search, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(loadCustomers, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadCustomers, search]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Clienti</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestione anagrafica clienti {totalElements > 0 && `· ${totalElements} totali`}
          </p>
        </div>
        <Button variant="accent" asChild>
          <Link href="/clienti/nuovo">
            <Plus className="w-4 h-4" />
            Nuovo cliente
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <Input
            placeholder="Cerca per nome, email, azienda..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => { setTypeFilter(f.value); setPage(0); }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                typeFilter === f.value
                  ? "bg-brand-800 text-white border-brand-800"
                  : "bg-white text-brand-700 border-brand-200 hover:bg-brand-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nessun cliente trovato"
              description={search ? "Prova a modificare la ricerca" : "Aggiungi il primo cliente"}
              action={
                !search ? (
                  <Button variant="accent" asChild>
                    <Link href="/clienti/nuovo"><Plus className="w-4 h-4" />Nuovo cliente</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Città</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Richieste</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {customers.map((c) => {
                  const totalReqs = (c.totalComodato || 0) + (c.totalContatti || 0) + (c.totalAssistenza || 0);
                  return (
                    <tr key={c.id} className="hover:bg-brand-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/clienti/${c.id}`} className="text-sm font-medium text-brand-900 hover:text-accent-gold transition-colors">
                          {c.fullName}
                        </Link>
                        {c.companyName && <p className="text-xs text-muted-foreground">{c.companyName}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.clientType === "AZIENDA" ? "info" : "secondary"}>
                          {c.clientType === "AZIENDA" ? "Azienda" : "Privato"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.city || "—"}</td>
                      <td className="px-4 py-3">
                        {totalReqs > 0 ? (
                          <Badge variant="warning">{totalReqs}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
      />
    </>
  );
}
