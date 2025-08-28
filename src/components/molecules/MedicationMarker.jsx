import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const MedicationMarker = ({ 
  medication, 
  position = { x: 0, y: 0 },
  isVisible = true 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute z-10"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        {/* Vertical line */}
        <div className="w-0.5 bg-primary-500 h-64 opacity-75"></div>
        
        {/* Pill icon */}
        <div className="absolute -left-2.5 top-0 bg-white border-2 border-primary-500 rounded-full p-1">
          <ApperIcon name="Pill" className="h-3 w-3 text-primary-500" />
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
              <div className="font-semibold">{medication.name}</div>
              <div className="text-gray-300">{medication.dose}</div>
              <div className="text-gray-400 text-xs">
                Started: {format(new Date(medication.startDate), "MMM dd, yyyy")}
              </div>
              {medication.note && (
                <div className="text-gray-300 text-xs mt-1 max-w-48">
                  {medication.note}
                </div>
              )}
              {/* Arrow */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationMarker;