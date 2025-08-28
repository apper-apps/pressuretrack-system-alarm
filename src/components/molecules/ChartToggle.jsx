import React from "react";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const ChartToggle = ({ 
  label, 
  isActive, 
  onToggle, 
  color = "primary",
  className 
}) => {
  const colorStyles = {
    primary: "border-primary-300 text-primary-700 bg-primary-50",
    success: "border-success-300 text-green-700 bg-success-50",
    warning: "border-warning-300 text-orange-700 bg-warning-50",
    error: "border-error-300 text-red-700 bg-error-50"
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={cn(
        "transition-all duration-200",
        isActive ? colorStyles[color] : "border-gray-200 text-gray-600 hover:bg-gray-50",
        className
      )}
    >
      <div className={cn(
        "w-3 h-3 rounded-full mr-2",
        isActive ? `bg-${color === "primary" ? "primary-600" : color === "success" ? "success-500" : color === "warning" ? "warning-500" : "error-500"}` : "bg-gray-300"
      )} />
      {label}
    </Button>
  );
};

export default ChartToggle;