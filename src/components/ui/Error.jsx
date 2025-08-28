import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="bg-error-50 rounded-full p-6 mb-6">
        <ApperIcon name="AlertTriangle" className="h-12 w-12 text-error-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center space-x-2"
        >
          <ApperIcon name="RefreshCw" className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default Error;