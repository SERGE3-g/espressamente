"use client";

import { useEffect, useState } from "react";
import { api, Brand } from "@/lib/api";
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
import { Plus, Pencil, Trash2, Award, ArrowUp, ArrowDown } from "lucide-react";
import { useAuthStore } from "@/store/auth";

export default function BrandPage() {
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  function loadData() {
    api.brands.getAll()
      .then((data) => setItems(data.sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setSortOrder(items.length > 0 ? Math.max(...items.map((b) => b.sortOrder)) + 1 : 0);
    setDialogOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setSortOrder(brand.sortOrder);
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
        await api.brands.update(editing.id, data);
        toast({ title: "Brand aggiornato", variant: "success" });
      } else {
        await api.brands.create(data);
        toast({ title: "Brand creato", variant: "success" });
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
      await api.brands.delete(deleteTarget.id);
      toast({ title: "Brand eliminato", variant: "success" });
      setDeleteTarget(null);
      loadData();
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function moveSortOrder(brand: Brand, direction: number) {
    try {
      await api.brands.update(brand.id, { name: brand.name, slug: brand.slug, sortOrder: brand.sortOrder + direction });
      loadData();
    } catch {
      toast({ title: "Errore nel riordinamento", variant: "destructive" });
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Brand</h1>
          <p className="text-sm text-muted-foreground mt-1">Marchi e produttori del catalogo</p>
        </div>
        {isSuperAdmin() && (
          <Button variant="accent" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Nuovo brand
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
              icon={Award}
              title="Nessun brand"
              description="Crea il primo brand per il catalogo"
              action={<Button variant="accent" onClick={openCreate}><Plus className="w-4 h-4" />Crea brand</Button>}
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
                {items.map((brand) => (
                  <tr key={brand.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-brand-900">{brand.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{brand.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground w-6">{brand.sortOrder}</span>
                        {isSuperAdmin() && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSortOrder(brand, -1)}>
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveSortOrder(brand, 1)}>
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                    {isSuperAdmin() && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(brand)}>
                            <Pencil className="w-4 h-4 text-brand-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(brand)}>
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
            <DialogTitle>{editing ? "Modifica brand" : "Nuovo brand"}</DialogTitle>
            <DialogDescription>
              {editing ? "Modifica i dettagli del brand." : "Aggiungi un nuovo brand al catalogo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">Nome</Label>
              <Input id="brand-name" value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(generateSlug(e.target.value)); }} placeholder="es. illy" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-slug">Slug</Label>
              <Input id="brand-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="illy" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-order">Ordine</Label>
              <Input id="brand-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
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

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina brand</DialogTitle>
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
}
