import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[var(--radius)] border border-brand-200 bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/40 focus-visible:border-accent-gold disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
