import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-xl border border-gray-200 bg-white px-md py-[10px] pr-[44px] text-[14px] font-medium text-gray-900 transition-all duration-150 focus:border-[#e86a33] focus:outline-none focus:ring-1 focus:ring-[#e86a33] hover:border-gray-300 cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    );
  }
);
Select.displayName = "Select";
