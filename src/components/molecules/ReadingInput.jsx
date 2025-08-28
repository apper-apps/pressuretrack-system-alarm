import React from "react";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const ReadingInput = ({ 
  sequence, 
  systolic, 
  diastolic, 
  pulse, 
  onChange,
  isCollapsed = false,
  onToggle,
  className 
}) => {
  const handleInputChange = (field, value) => {
    onChange(sequence, field, value ? parseInt(value) : "");
  };

  const getReadingStatus = () => {
    if (!systolic || !diastolic) return "default";
    
    // NICE guidelines: Normal <140/90, High >180/110
    if (systolic >= 180 || diastolic >= 110) return "error";
    if (systolic >= 140 || diastolic >= 90) return "warning";
    return "success";
  };

  const status = getReadingStatus();

  const statusStyles = {
    default: "border-gray-200",
    success: "border-success-300 bg-gradient-to-r from-success-50 to-green-50",
    warning: "border-warning-300 bg-gradient-to-r from-warning-50 to-orange-50",
    error: "border-error-300 bg-gradient-to-r from-error-50 to-red-50"
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all duration-200",
      statusStyles[status],
      className
    )}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h4 className="font-medium text-gray-900">Reading {sequence}</h4>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              isCollapsed ? "transform rotate-180" : ""
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            label="Systolic (mmHg)"
            type="number"
            value={systolic}
            onChange={(e) => handleInputChange("systolic", e.target.value)}
            placeholder="120"
            min="70"
            max="250"
            required
          />
          <Input
            label="Diastolic (mmHg)"
            type="number"
            value={diastolic}
            onChange={(e) => handleInputChange("diastolic", e.target.value)}
            placeholder="80"
            min="40"
            max="150"
            required
          />
          <Input
            label="Pulse (optional)"
            type="number"
            value={pulse}
            onChange={(e) => handleInputChange("pulse", e.target.value)}
            placeholder="70"
            min="30"
            max="200"
          />
        </div>
      )}
    </div>
  );
};

export default ReadingInput;