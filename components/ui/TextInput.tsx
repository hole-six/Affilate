import { InputHTMLAttributes, forwardRef } from "react";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border border-gray-200 bg-white px-md py-[10px] text-[14px] font-medium text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33] hover:border-gray-300 ${className}`}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";
