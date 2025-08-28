import React from "react";
import PressureChart from "@/components/organisms/PressureChart";

const ChartView = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chart View</h1>
        <p className="text-gray-600">
          Visualize your blood pressure trends and analyze medication effectiveness
        </p>
      </div>

      {/* Chart Component */}
      <PressureChart />
    </div>
  );
};

export default ChartView;