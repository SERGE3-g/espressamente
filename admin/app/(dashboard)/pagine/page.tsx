"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, CmsPage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, FileText, Pencil, ExternalLink, Trash2, Search } from "lucide-react";

const FILTERS = [
  { label: "Tutte", value: undefined as boolean | undefined },
  { label: "Pubblicate", value: true },
  { label: "Bozze", value: false },
];

export default function PaginePage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CmsPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPages = useCallback(() => {
    setLoading(true);
    api.pages
      .getAll(search || undefined, publishedFilter)
      .then(setPages)
      .catch((e) => {
        console.error(e);
        toast({ title: "Errore nel caricamento pagine", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [search, publishedFilter]);

  useEffect(() => {
    const timer = setTimeout(loadPages, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadPages, search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.pages.delete(deleteTarget.id);
      setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast({ title: "Pagina eliminata", variant: "success" });
    } catch {
      toast({ title: "Errore nell'eliminazione", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Pagine CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestione contenuti statici del sito</p>
        </div>
        <Button variant="accent" asChild>
          <Link href="/pagine/nuovo">
            <Plus className="w-4 h-4" />
            Nuova pagina
          </Link>
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
          <Input
            placeholder="Cerca pagina..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setPublishedFilter(f.value)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                publishedFilter === f.value
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
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : pages.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nessuna pagina"
              description={search ? "Nessun risultato per la ricerca" : "Crea la prima pagina CMS per il sito"}
              action={
                !search ? (
                  <Button variant="accent" asChild>
                    <Link href="/pagine/nuovo"><Plus className="w-4 h-4" />Crea pagina</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pagina</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">URL</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Stato</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Aggiornamento</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-brand-900">{page.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">/{page.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant={page.isPublished ? "success" : "secondary"}>
                        {page.isPublished ? "Pubblicata" : "Bozza"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/pagine/${page.slug}`}>
                            <Pencil className="w-4 h-4 text-brand-500" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 text-brand-400" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600"
                          onClick={() => setDeleteTarget(page)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare la pagina?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Stai per eliminare la pagina <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>. Questa azione è irreversibile.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annulla</Button>
            <Button variant="destructive" loading={deleting} onClick={handleDelete}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
