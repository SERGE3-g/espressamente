"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, ComodatoRequest } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { FileText, ChevronRight } from "lucide-react";

const STATUSES = ["", "NUOVO", "IN_LAVORAZIONE", "COMPLETATO", "ARCHIVIATO"];
const STATUS_LABELS: Record<string, string> = {
  "": "Tutti",
  NUOVO: "Nuovo",
  IN_LAVORAZIONE: "In lavorazione",
  COMPLETATO: "Completato",
  ARCHIVIATO: "Archiviato",
};

export default function ComodatoPage() {
  const [items, setItems] = useState<ComodatoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.comodato
      .getAll(page, statusFilter || undefined, pageSize)
      .then((res) => {
        setItems(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Errore caricamento"))
      .finally(() => setLoading(false));
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Richieste Comodato"
        description="Gestisci le richieste di comodato d'uso macchinette"
      />

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(0);
            }}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              statusFilter === s
                ? "bg-brand-700 text-white"
                : "bg-brand-100 text-brand-700 hover:bg-brand-200"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={load} className="underline font-medium">Riprova</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2.5 flex-1">
                    <Skeleton className="h-5 w-40 bg-brand-100" />
                    <Skeleton className="h-4 w-64 bg-brand-50" />
                    <Skeleton className="h-4 w-48 bg-brand-50" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full bg-brand-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nessuna richiesta trovata"
          description={
            statusFilter
              ? "Non ci sono richieste con questo stato. Prova a cambiare il filtro."
              : "Non sono ancora arrivate richieste di comodato."
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link key={item.id} href={`/comodato/${item.id}`}>
              <Card className="hover:border-brand-300 hover:shadow-md transition-all duration-150 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm font-semibold text-brand-900">
                          {item.fullName}
                        </p>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{item.email}</span>
                        <span className="text-brand-300">&middot;</span>
                        <span>{item.city}</span>
                        {item.machineName && (
                          <>
                            <span className="text-brand-300">&middot;</span>
                            <span>{item.machineName}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(item.createdAt).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-brand-300 shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalElements={totalElements}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
      />
    </div>
  );
}
