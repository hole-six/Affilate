import { InputHTMLAttributes, forwardRef } from "react";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border border-ink/10 bg-canvas px-md py-[10px] text-[14px] font-medium text-ink placeholder:text-mute/50 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary hover:border-ink/20 ${className}`}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";
