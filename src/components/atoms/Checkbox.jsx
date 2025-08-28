import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Checkbox = forwardRef(({ 
  className, 
  label,
  description,
  error,
  ...props 
}, ref) => {
  const id = props.id || props.name;

  return (
    <div className="flex items-start space-x-3">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={cn(
          "h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
          "transition-all duration-200 cursor-pointer",
          error && "border-error-300",
          className
        )}
        {...props}
      />
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              htmlFor={id}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {error && (
            <p className="text-sm text-error-600 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;