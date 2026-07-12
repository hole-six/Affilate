import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#e86a33] text-white hover:bg-[#d65d2a] hover:shadow-md hover:shadow-[#e86a33]/20 active:bg-[#c25324] focus-visible:ring-[#e86a33]",
  secondary:
    "bg-[#fff0e6] text-[#e86a33] hover:bg-[#ffe5d4] active:bg-[#ffd9c2] focus-visible:ring-[#ffe5d4]",
  tertiary:
    "bg-white text-gray-700 border border-gray-200 hover:border-[#e86a33] hover:text-[#e86a33] active:bg-gray-50 focus-visible:ring-gray-200",
  danger:
    "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 focus-visible:ring-red-200",
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
