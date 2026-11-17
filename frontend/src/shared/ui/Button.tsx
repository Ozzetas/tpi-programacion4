import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 disabled:bg-orange-300",
  secondary:
    "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500 disabled:bg-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400 disabled:opacity-50",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Procesando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}