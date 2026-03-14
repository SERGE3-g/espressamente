"use client";

import { useEffect, useState, useCallback } from "react";
import { api, AuditLog } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  STATUS_CHANGE: "bg-amber-100 text-amber-700",
  UPLOAD: "bg-purple-100 text-purple-700",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    api.audit.getAll(page, pageSize)
      .then((res) => {
        setLogs(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(() => toast({ title: "Errore nel caricamento", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-900">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Registro delle azioni degli amministratori</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : logs.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="Nessun log" description="Le azioni degli amministratori appariranno qui" />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Admin</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Azione</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Entità</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Descrizione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-brand-700">{log.adminUsername}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[log.action] || "bg-brand-100 text-brand-700"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {log.entityType && (
                        <span>{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-brand-900 max-w-xs truncate">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

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
