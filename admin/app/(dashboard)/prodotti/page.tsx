"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Pagination } from "@/components/shared/Pagination";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  ImageIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/api$/, "");

const TYPE_LABELS: Record<string, string> = {
  CAFFE: "Caffe",
  MACCHINA: "Macchina",
  ACCESSORIO: "Accessorio",
};

const TYPE_FILTERS = [
  { value: "", label: "Tutti" },
  { value: "CAFFE", label: "Caffe" },
  { value: "MACCHINA", label: "Macchine" },
  { value: "ACCESSORIO", label: "Accessori" },
];

export default function ProdottiPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.products
      .getAll(page, pageSize, typeFilter || undefined)
      .then((res) => {
        setProducts(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(() => {
        toast({
          title: "Errore",
          description: "Impossibile caricare i prodotti",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.products.delete(deleteTarget.id);
      toast({
        title: "Prodotto eliminato",
        description: `"${deleteTarget.name}" e stato eliminato con successo.`,
        variant: "success",
      });
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast({
        title: "Errore",
        description:
          e instanceof Error ? e.message : "Impossibile eliminare il prodotto",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Prodotti</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestisci il catalogo prodotti
          </p>
        </div>
        {isSuperAdmin() && (
          <Link href="/prodotti/nuovo">
            <Button variant="accent">
              <Plus className="w-4 h-4" />
              Nuovo prodotto
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <Input
            placeholder="Cerca prodotto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTypeFilter(t.value);
                setPage(0);
              }}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer ${
                typeFilter === t.value
                  ? "bg-brand-700 text-white border-brand-700 shadow-sm"
                  : "bg-white text-brand-600 border-brand-200 hover:bg-brand-50 hover:border-brand-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 bg-brand-100/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nessun prodotto trovato"
              description={
                search
                  ? `Nessun risultato per "${search}"`
                  : "Inizia aggiungendo il tuo primo prodotto al catalogo."
              }
              action={
                !search ? (
                  <Link href="/prodotti/nuovo">
                    <Button variant="accent" size="sm">
                      <Plus className="w-4 h-4" />
                      Nuovo prodotto
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-200">
                    <th className="text-left text-xs font-semibold text-brand-500 uppercase tracking-wider px-5 py-3 w-16">
                      Foto
                    </th>
                    <th className="text-left text-xs font-semibold text-brand-500 uppercase tracking-wider px-5 py-3">
                      Prodotto
                    </th>
                    <th className="text-left text-xs font-semibold text-brand-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Tipo
                    </th>
                    <th className="text-left text-xs font-semibold text-brand-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Brand
                    </th>
                    <th className="text-left text-xs font-semibold text-brand-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      Prezzo
                    </th>
                    <th className="text-left text-xs font-semibold text-brand-500 uppercase tracking-wider px-5 py-3">
                      Stato
                    </th>
                    {isSuperAdmin() && <th className="px-5 py-3 w-24" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-brand-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0].startsWith("/api/uploads/") ? `${API_BASE}${p.images[0]}` : p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-brand-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-brand-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-brand-900">
                            {p.name}
                          </p>
                          <p className="text-xs text-brand-400 mt-0.5">
                            {p.category?.name ?? "Senza categoria"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <Badge variant="secondary">
                          {TYPE_LABELS[p.productType]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-brand-600">
                          {p.brand?.name ?? "---"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-sm font-medium text-brand-800">
                          {p.price
                            ? `${p.price.toFixed(2)} EUR`
                            : p.priceLabel ?? "---"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={p.isActive ? "success" : "secondary"}
                        >
                          {p.isActive ? "Attivo" : "Nascosto"}
                        </Badge>
                      </td>
                      {isSuperAdmin() && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <Link href={`/prodotti/${p.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-brand-400 hover:text-brand-700"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-brand-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteTarget(p)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina prodotto</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare{" "}
              <span className="font-medium text-brand-900">
                {deleteTarget?.name}
              </span>
              ? Questa azione non puo essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                Annulla
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              loading={deleting}
              onClick={handleDelete}
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
