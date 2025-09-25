import React from "react";
import { Home, FileText, BarChart3, MessageSquare } from "lucide-react";

const Navigation = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "stage1", label: "Report", icon: FileText },
    { id: "stage2", label: "Process", icon: BarChart3 },
    { id: "stage3", label: "Review", icon: MessageSquare },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
