import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "secondary" | "outline" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-900 text-white hover:bg-brand-800 focus:ring-brand-700 hover:shadow-md",
  secondary:
    "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400 hover:shadow-md",
  outline:
    "border border-brand-300 text-brand-900 hover:bg-brand-50 hover:border-brand-400 focus:ring-brand-700",
  accent:
    "bg-gradient-to-r from-brand-400 to-brand-500 text-white hover:from-brand-500 hover:to-brand-600 focus:ring-brand-400 hover:shadow-lg hover:shadow-brand-400/20",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className,
        ),
      )}
      {...props}
    />
  );
}
