"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, Product, Category, Brand } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectNative } from "@/components/ui/select-native";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/ImageUpload";

const schema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  shortDescription: z.string().optional(),
  productType: z.enum(["CAFFE", "MACCHINA", "ACCESSORIO"]),
  price: z.string().optional(),
  priceLabel: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      shortDescription: product?.shortDescription ?? "",
      productType: product?.productType ?? "CAFFE",
      price: product?.price != null ? String(product.price) : "",
      priceLabel: product?.priceLabel ?? "",
      isFeatured: product?.isFeatured ?? false,
      isActive: product?.isActive ?? true,
      categoryId:
        product?.category?.id != null ? String(product.category.id) : "",
      brandId: product?.brand?.id != null ? String(product.brand.id) : "",
    },
  });

  useEffect(() => {
    Promise.all([api.categories.getAll(), api.brands.getAll()])
      .then(([cats, brnds]) => {
        setCategories(cats);
        setBrands(brnds);
      })
      .catch(console.error);
  }, []);

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      shortDescription: data.shortDescription || null,
      productType: data.productType,
      price: data.price ? parseFloat(data.price) : null,
      priceLabel: data.priceLabel || null,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      brandId: data.brandId ? Number(data.brandId) : null,
      images,
    };

    try {
      if (product) {
        await api.products.update(product.id, payload);
        toast({
          title: "Prodotto aggiornato",
          description: `"${data.name}" e stato aggiornato con successo.`,
          variant: "success",
        });
      } else {
        await api.products.create(payload);
        toast({
          title: "Prodotto creato",
          description: `"${data.name}" e stato aggiunto al catalogo.`,
          variant: "success",
        });
      }
      onSuccess();
    } catch (e) {
      toast({
        title: "Errore",
        description:
          e instanceof Error ? e.message : "Impossibile salvare il prodotto",
        variant: "destructive",
      });
    }
  }

  const typeOptions = [
    { value: "CAFFE", label: "Caffe" },
    { value: "MACCHINA", label: "Macchina" },
    { value: "ACCESSORIO", label: "Accessorio" },
  ];

  const categoryOptions = [
    { value: "", label: "--- Nessuna ---" },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const brandOptions = [
    { value: "", label: "--- Nessuno ---" },
    ...brands.map((b) => ({ value: String(b.id), label: b.name })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column -- main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informazioni */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni</CardTitle>
              <CardDescription>
                Dati principali del prodotto visibili nel catalogo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product?.sku && (
                  <div className="space-y-2">
                    <Label>Codice (SKU)</Label>
                    <div className="flex h-9 items-center rounded-lg border border-brand-200 bg-muted/50 px-3 font-mono text-sm text-muted-foreground">
                      {product.sku}
                    </div>
                  </div>
                )}
                <div className={`space-y-2 ${product?.sku ? "sm:col-span-2" : "sm:col-span-3"}`}>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome del prodotto"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Descrizione breve</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Una breve descrizione del prodotto..."
                  rows={4}
                  {...register("shortDescription")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo prodotto *</Label>
                  <SelectNative
                    id="productType"
                    options={typeOptions}
                    {...register("productType")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <SelectNative
                    id="categoryId"
                    options={categoryOptions}
                    {...register("categoryId")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandId">Brand</Label>
                <SelectNative
                  id="brandId"
                  options={brandOptions}
                  {...register("brandId")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Immagini */}
          <Card>
            <CardHeader>
              <CardTitle>Immagini</CardTitle>
              <CardDescription>
                Carica fino a 5 immagini del prodotto (JPG, PNG, WebP).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload images={images} onChange={setImages} maxImages={5} />
            </CardContent>
          </Card>

          {/* Prezzo */}
          <Card>
            <CardHeader>
              <CardTitle>Prezzo</CardTitle>
              <CardDescription>
                Imposta il prezzo numerico oppure un&apos;etichetta testuale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prezzo (EUR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("price")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceLabel">Etichetta prezzo</Label>
                  <Input
                    id="priceLabel"
                    placeholder="es. Su richiesta"
                    {...register("priceLabel")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column -- settings */}
        <div className="space-y-6">
          {/* Impostazioni */}
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni</CardTitle>
              <CardDescription>
                Visibilita e posizionamento del prodotto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-brand-900">
                        Prodotto attivo
                      </Label>
                      <p className="text-xs text-brand-400">
                        Visibile nel catalogo pubblico
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <div className="border-t border-brand-100" />

              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-brand-900">
                        In evidenza
                      </Label>
                      <p className="text-xs text-brand-400">
                        Mostrato nella homepage
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                type="submit"
                variant="accent"
                className="w-full"
                loading={isSubmitting}
              >
                {product ? "Aggiorna prodotto" : "Crea prodotto"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
              >
                Annulla
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
