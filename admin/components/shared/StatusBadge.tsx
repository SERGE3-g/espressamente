import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "info" | "secondary" | "destructive" }
> = {
  NUOVO:          { label: "Nuovo",          variant: "info" },
  IN_LAVORAZIONE: { label: "In lavorazione", variant: "warning" },
  COMPLETATO:     { label: "Completato",     variant: "success" },
  ARCHIVIATO:     { label: "Archiviato",     variant: "secondary" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
