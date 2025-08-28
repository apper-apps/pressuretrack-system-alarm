import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  className, 
  label,
  error,
  helperText,
  required = false,
  children,
  ...props 
}, ref) => {
  const id = props.id || props.name;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          "w-full px-4 py-3 border rounded-md transition-all duration-200 focus:ring-2 focus:ring-offset-0",
          "focus:ring-primary-500 focus:border-transparent bg-white",
          error ? "border-error-300 bg-error-50" : "border-gray-200",
          "hover:border-gray-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;