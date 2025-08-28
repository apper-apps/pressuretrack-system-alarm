import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className, 
  variant = "default",
  hover = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-lg shadow-sm border";
  
  const variants = {
    default: "border-gray-100 p-6",
    compact: "border-gray-100 p-4",
    elevated: "border-gray-100 p-6 shadow-md",
    success: "border-success-200 bg-gradient-to-br from-success-50 to-green-50 p-6",
    warning: "border-warning-300 bg-gradient-to-br from-warning-50 to-orange-50 p-6",
    error: "border-error-300 bg-gradient-to-br from-error-50 to-red-50 p-6",
    primary: "border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50 p-6"
  };

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        hover && "hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;