"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  paramName: string;
  label: string;
}

export function FilterBar({ options, paramName, label }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) || "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-px">
      <button
        onClick={() => handleChange("")}
        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
          current === ""
            ? "border-brand-800 text-brand-900"
            : "border-transparent text-brand-400 hover:text-brand-700 hover:border-brand-200"
        }`}
      >
        Tutti
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
            current === opt.value
              ? "border-brand-800 text-brand-900"
              : "border-transparent text-brand-400 hover:text-brand-700 hover:border-brand-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
