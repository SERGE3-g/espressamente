"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZES = [5, 10, 20];

interface Props {
  page: number;
  totalPages: number;
  pageSize: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
}: Props) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Righe per pagina:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-md border border-brand-200 bg-white px-2 text-sm text-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {totalElements !== undefined && (
          <span className="text-sm text-muted-foreground ml-2">
            {totalElements} totali
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
          Precedente
        </Button>
        <span className="text-sm font-medium text-brand-700 px-2">
          {page + 1} / {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Successiva
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
