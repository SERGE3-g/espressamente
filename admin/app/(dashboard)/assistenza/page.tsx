"use client";

import { useEffect, useState, useCallback } from "react";
import { api, ServiceRequest } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Pagination } from "@/components/shared/Pagination";
import { Wrench, ChevronDown } from "lucide-react";

const STATUSES = ["", "NUOVO", "IN_LAVORAZIONE", "COMPLETATO", "ARCHIVIATO"];
const STATUS_LABELS: Record<string, string> = {
  "": "Tutti",
  NUOVO: "Nuovo",
  IN_LAVORAZIONE: "In lavorazione",
  COMPLETATO: "Completato",
  ARCHIVIATO: "Archiviato",
};

export default function AssistenzaPage() {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.services
      .getAll(page, pageSize)
      .then((res) => {
        setItems(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatus(id: number, status: string) {
    setUpdating(id);
    try {
      await api.services.updateStatus(id, status);
      load();
      setExpanded(null);
      toast({
        title: "Stato aggiornato",
        description: `Richiesta impostata come "${STATUS_LABELS[status]}"`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Errore",
        description: e instanceof Error ? e.message : "Errore aggiornamento",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  }

  const filtered = statusFilter
    ? items.filter((i) => i.status === statusFilter)
    : items;

  return (
    <div>
      <PageHeader
        title="Richieste Assistenza"
        description="Gestisci le richieste di assistenza tecnica"
      />

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
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
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full bg-brand-100" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nessuna richiesta trovata"
          description={
            statusFilter
              ? "Non ci sono richieste con questo stato. Prova a cambiare il filtro."
              : "Non sono ancora arrivate richieste di assistenza."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className={
                expanded === item.id
                  ? "border-brand-300 shadow-md"
                  : "hover:border-brand-300 hover:shadow-md transition-all duration-150"
              }
            >
              {/* Header row - clickable */}
              <button
                className="w-full text-left p-5 cursor-pointer"
                onClick={() =>
                  setExpanded(expanded === item.id ? null : item.id)
                }
              >
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
                      <span>
                        {item.machineBrand} {item.machineModel}
                      </span>
                      <span className="text-brand-300">&middot;</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-400 shrink-0 mt-1 transition-transform duration-200 ${
                      expanded === item.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Expanded content */}
              {expanded === item.id && (
                <CardContent className="pt-0 pb-5 px-5 border-t border-brand-100">
                  <div className="pt-4">
                    {/* Machine info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Tel: </span>
                        <span className="text-brand-900 font-medium">
                          {item.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Marca: </span>
                        <span className="text-brand-900 font-medium">
                          {item.machineBrand}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Modello:{" "}
                        </span>
                        <span className="text-brand-900 font-medium">
                          {item.machineModel}
                        </span>
                      </div>
                    </div>

                    {/* Issue description */}
                    <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-brand-900 whitespace-pre-wrap">
                        {item.issueDescription}
                      </p>
                    </div>

                    {/* Status actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground mr-1">
                        Cambia stato:
                      </span>
                      {["IN_LAVORAZIONE", "COMPLETATO", "ARCHIVIATO"].map(
                        (s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={item.status === s ? "default" : "outline"}
                            disabled={
                              updating === item.id || item.status === s
                            }
                            onClick={() => handleStatus(item.id, s)}
                            loading={updating === item.id && item.status !== s}
                          >
                            {STATUS_LABELS[s]}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
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
