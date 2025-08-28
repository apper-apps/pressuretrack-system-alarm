import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const MobileSidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "BarChart3" },
    { name: "Add Reading", href: "/add-reading", icon: "Plus" },
    { name: "Chart View", href: "/chart", icon: "Activity" },
    { name: "Medications", href: "/medications", icon: "Pill" },
    { name: "Profile", href: "/profile", icon: "User" },
    { name: "Export", href: "/export", icon: "Download" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 bg-white w-64 z-50 lg:hidden shadow-xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-2 rounded-xl">
                      <ApperIcon name="Activity" className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">PressureTrack</h1>
                      <p className="text-xs text-primary-600 font-medium">Pro</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;