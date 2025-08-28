import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ className }) => {
const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Add Reading", href: "/add-reading", icon: "Plus" },
    { name: "Readings", href: "/readings", icon: "List" },
    { name: "Chart View", href: "/chart", icon: "Activity" },
    { name: "Medications", href: "/medications", icon: "Pill" },
    { name: "Profile", href: "/profile", icon: "User" },
    { name: "Export", href: "/export", icon: "Download" }
  ];

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 w-64 flex-shrink-0",
      className
    )}>
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-2 rounded-xl">
              <ApperIcon name="Activity" className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PressureTrack</h1>
              <p className="text-sm text-primary-600 font-medium">Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm"
                    : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ApperIcon 
                    name={item.icon} 
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-white" : "text-gray-500"
                    )} 
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <ApperIcon name="Shield" className="h-4 w-4" />
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;