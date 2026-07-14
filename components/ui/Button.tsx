import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-active hover:shadow-md hover:shadow-primary/20 active:bg-primary-active focus-visible:ring-primary",
  secondary:
    "bg-primary-pale text-primary hover:bg-primary-neutral active:bg-primary-neutral focus-visible:ring-primary-pale",
  tertiary:
    "bg-canvas text-mute border border-ink/10 hover:border-primary hover:text-primary active:bg-canvas-soft focus-visible:ring-ink/20",
  danger:
    "bg-negative/10 text-negative hover:bg-negative/20 active:bg-negative/30 focus-visible:ring-negative/30",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-lg py-xs text-[13px] leading-5 gap-xs",
  md: "px-xl py-sm text-[14px] leading-6 gap-sm",
  lg: "px-2xl py-md text-[15px] leading-6 gap-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
