import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data available", 
  description = "Get started by adding your first entry",
  icon = "FileText",
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="bg-primary-50 rounded-full p-8 mb-8">
        <ApperIcon name={icon} className="h-16 w-16 text-primary-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        {description}
      </p>
      {action}
    </div>
  );
};

export default Empty;