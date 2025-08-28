import React from "react";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const DateRangePicker = ({ 
  activeRange, 
  onRangeChange, 
  customRange,
  onCustomRangeChange,
  className 
}) => {
  const ranges = [
    { key: "7", label: "7 days" },
    { key: "30", label: "30 days" },
    { key: "90", label: "90 days" },
    { key: "180", label: "180 days" },
    { key: "all", label: "All time" },
    { key: "custom", label: "Custom" }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => (
          <Button
            key={range.key}
            variant={activeRange === range.key ? "primary" : "outline"}
            size="sm"
            onClick={() => onRangeChange(range.key)}
          >
            {range.label}
          </Button>
        ))}
      </div>
      
      {activeRange === "custom" && (
        <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={customRange?.start || ""}
              onChange={(e) => onCustomRangeChange({ ...customRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={customRange?.end || ""}
              onChange={(e) => onCustomRangeChange({ ...customRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;