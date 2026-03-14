"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export function ImageUpload({ images, onChange, maxImages = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length >= maxImages) {
      toast({ title: `Massimo ${maxImages} immagini`, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (images.length >= maxImages) break;
        const url = await api.upload.image(file);
        onChange([...images, url]);
      }
    } catch (e) {
      toast({ title: "Upload fallito", description: e instanceof Error ? e.message : "Errore", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-brand-200 bg-brand-50">
              <img
                src={url.startsWith("/api/uploads/") ? `${API_BASE.replace(/\/api$/, "")}${url}` : url.startsWith("/uploads/") ? `${API_BASE}${url}` : url}
                alt={`Immagine ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            dragging
              ? "border-accent-gold bg-accent-gold/5"
              : "border-brand-200 hover:border-brand-400 bg-brand-50 hover:bg-brand-100/50"
          }`}
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              Caricamento in corso...
            </div>
          ) : (
            <>
              {images.length === 0 ? (
                <ImageIcon className="w-8 h-8 text-brand-300" />
              ) : (
                <Upload className="w-6 h-6 text-brand-400" />
              )}
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium text-brand-700">Clicca</span> o trascina un&apos;immagine
              </p>
              <p className="text-xs text-brand-400">JPG, PNG, WebP — max 10 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
