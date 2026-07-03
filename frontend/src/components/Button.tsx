import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  loading?: boolean;
}

const VARIANT_STYLES: Record<string, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50",
  secondary:
    "bg-transparent border border-border text-text-primary dark:text-text-primaryDark hover:bg-black/5 dark:hover:bg-white/5",
  ghost:
    "bg-transparent text-text-primary dark:text-text-primaryDark hover:bg-black/5 dark:hover:bg-white/5",
  destructive:
    "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/50",
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
