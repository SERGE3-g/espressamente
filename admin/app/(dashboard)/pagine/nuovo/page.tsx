"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function NewPagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  function generateSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.pages.create({
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        content,
        isPublished,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
      });
      toast({ title: "Pagina creata", variant: "success" });
      router.push("/pagine");
    } catch (e) {
      toast({ title: "Errore", description: e instanceof Error ? e.message : "Errore nella creazione", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/pagine" className="inline-flex items-center gap-1 text-sm text-brand-500 hover:text-brand-700 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Pagine
          </Link>
          <h1 className="text-2xl font-semibold text-brand-900">Nuova pagina</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <span className="text-sm text-brand-700">{isPublished ? "Pubblicata" : "Bozza"}</span>
          </div>
          <Button variant="accent" onClick={handleSave} loading={saving} disabled={!title.trim()}>
            <Save className="w-4 h-4" />
            Crea
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
                <Input id="page-title" value={title} onChange={(e) => { setTitle(e.target.value); setSlug(generateSlug(e.target.value)); }} placeholder="es. Chi siamo" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="page-slug">Slug URL</Label>
                <Input id="page-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="chi-siamo" className="font-mono" />
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
