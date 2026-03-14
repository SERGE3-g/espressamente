"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, CmsPage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    api.pages.getBySlug(slug)
      .then((p) => {
        setPage(p);
        setTitle(p.title);
        setPageSlug(p.slug);
        setContent(p.content);
        setIsPublished(p.isPublished);
        setMetaTitle(p.metaTitle || "");
        setMetaDescription(p.metaDescription || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.pages.update(page!.id, {
        title: title.trim(),
        slug: pageSlug.trim(),
        content,
        isPublished,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
      });
      toast({ title: "Pagina salvata", variant: "success" });
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore nel salvataggio", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Pagina non trovata</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/pagine">Torna alle pagine</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/pagine" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-700 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Pagine
          </Link>
          <h1 className="text-2xl font-semibold text-brand-900">Modifica: {page.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <span className="text-sm text-brand-700">{isPublished ? "Pubblicata" : "Bozza"}</span>
          </div>
          <Button variant="accent" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Salva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <RichTextEditor content={content} onChange={setContent} />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dettagli pagina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="page-title">Titolo</Label>
                <Input id="page-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="page-slug">Slug URL</Label>
                <Input id="page-slug" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meta-title">Meta Title (SEO)</Label>
                <Input id="meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Titolo per i motori di ricerca" />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/60 caratteri</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meta-desc">Meta Description (SEO)</Label>
                <textarea
                  id="meta-desc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Descrizione per i motori di ricerca"
                  rows={3}
                  className="flex w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold"
                />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160 caratteri</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
