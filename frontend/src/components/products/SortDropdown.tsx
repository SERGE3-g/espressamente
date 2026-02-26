"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const sortOptions = [
  { label: "Consigliati", value: "" },
  { label: "Prezzo: crescente", value: "price,asc" },
  { label: "Prezzo: decrescente", value: "price,desc" },
  { label: "Novità", value: "createdAt,desc" },
  { label: "Nome A-Z", value: "name,asc" },
];

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-white border border-brand-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-brand-700 font-medium cursor-pointer hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 transition-colors"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400 pointer-events-none" />
    </div>
  );
}
