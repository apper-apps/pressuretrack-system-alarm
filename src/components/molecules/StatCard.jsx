import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  trendValue,
  variant = "default",
  className 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success-200 bg-gradient-to-br from-success-50 to-green-50";
      case "warning":
        return "border-warning-300 bg-gradient-to-br from-warning-50 to-orange-50";
      case "error":
        return "border-error-300 bg-gradient-to-br from-error-50 to-red-50";
      default:
        return "border-gray-100";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-success-500 bg-success-100";
      case "warning":
        return "text-warning-500 bg-warning-100";
      case "error":
        return "text-error-500 bg-error-100";
      default:
        return "text-primary-600 bg-primary-100";
    }
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-all duration-200",
        getVariantStyles(),
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                className={cn(
                  "h-4 w-4 mr-1",
                  trend === "up" ? "text-success-500" : "text-error-500"
                )}
              />
              <span className={cn(
                "text-sm font-medium",
                trend === "up" ? "text-success-600" : "text-error-600"
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-3 rounded-full",
            getIconColor()
          )}>
            <ApperIcon name={icon} className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;