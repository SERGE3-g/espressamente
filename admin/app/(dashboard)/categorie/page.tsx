"use client";

import { useEffect, useState } from "react";
import { api, Category } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Tag, ArrowUp, ArrowDown } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function CategoriePage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  function loadData() {
    api.categories.getAll()
      .then((data) => setItems(data.sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setSortOrder(items.length > 0 ? Math.max(...items.map((c) => c.sortOrder)) + 1 : 0);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSortOrder(cat.sortOrder);
    setDialogOpen(true);
  }

  function generateSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), slug: slug.trim() || generateSlug(name), sortOrder };
      if (editing) {
        await api.categories.update(editing.id, data);
        toast({ title: "Categoria aggiornata", variant: "success" });
      } else {
        await api.categories.create(data);
        toast({ title: "Categoria creata", variant: "success" });
      }
      setDialogOpen(false);
      loadData();
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await api.categories.delete(deleteTarget.id);
      toast({ title: "Categoria eliminata", variant: "success" });
      setDeleteTarget(null);
      loadData();
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Categorie</h1>
          <p className="text-sm text-muted-foreground mt-1">Categorie prodotti del catalogo</p>
        </div>
        {isSuperAdmin() && (
          <Button variant="accent" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Nuova categoria
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="Nessuna categoria"
              description="Crea la prima categoria per organizzare i prodotti"
              action={<Button variant="accent" onClick={openCreate}><Plus className="w-4 h-4" />Crea categoria</Button>}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Slug</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Ordine</th>
                  {isSuperAdmin() && <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Azioni</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {items.map((cat) => (
                  <tr key={cat.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-brand-900">{cat.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{cat.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground w-6">{cat.sortOrder}</span>
                        {isSuperAdmin() && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSortOrder(cat, -1)}>
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSortOrder(cat, 1)}>
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                    {isSuperAdmin() && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                            <Pencil className="w-4 h-4 text-brand-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(cat)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifica categoria" : "Nuova categoria"}</DialogTitle>
            <DialogDescription>
              {editing ? "Modifica i dettagli della categoria." : "Crea una nuova categoria per il catalogo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nome</Label>
              <Input id="cat-name" value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(generateSlug(e.target.value)); }} placeholder="es. Caffè in Grani" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="caffe-in-grani" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Ordine</Label>
              <Input id="cat-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button variant="accent" onClick={handleSave} loading={saving} disabled={!name.trim()}>
              {editing ? "Salva" : "Crea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina categoria</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare &quot;{deleteTarget?.name}&quot;? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDelete} loading={saving}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  async function moveSortOrder(cat: Category, direction: number) {
    const newOrder = cat.sortOrder + direction;
    try {
      await api.categories.update(cat.id, { name: cat.name, slug: cat.slug, sortOrder: newOrder });
      loadData();
    } catch {
      toast({ title: "Errore nel riordinamento", variant: "destructive" });
    }
  }
}
