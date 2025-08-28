import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-1.5 rounded-lg">
              <ApperIcon name="Activity" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PressureTrack</h1>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-primary-600 font-medium">
          Pro
        </div>
      </div>
    </header>
  );
};

export default Header;