import React from "react";
import {
  Filter,
  Clock,
  AlertTriangle,
  Building2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const StageTwo = ({ data, onUpdate, onNext, onBack }) => {
  const urgencyLevels = [
    {
      value: "low",
      label: "Low",
      color: "text-green-600 border-green-300 bg-green-50",
      description: "Can wait",
    },
    {
      value: "medium",
      label: "Medium",
      color: "text-yellow-600 border-yellow-300 bg-yellow-50",
      description: "Should be addressed",
    },
    {
      value: "high",
      label: "High",
      color: "text-orange-600 border-orange-300 bg-orange-50",
      description: "Needs attention",
    },
    {
      value: "critical",
      label: "Critical",
      color: "text-red-600 border-red-300 bg-red-50",
      description: "Immediate action",
    },
  ];

  const frequencyOptions = [
    {
      value: "first-time",
      label: "First Time",
      description: "Never happened before",
    },
    {
      value: "recurring",
      label: "Recurring",
      description: "Happens occasionally",
    },
    { value: "ongoing", label: "Ongoing", description: "Continuous problem" },
  ];

  const departments = [
    "Road Department",
    "Water & Sanitation",
    "Electrical Department",
    "Parks & Recreation",
    "Traffic Management",
    "Environmental Services",
    "Public Safety",
    "Building & Permits",
  ];

  // Auto-assign department based on category
  const getRecommendedDepartment = (category) => {
    const mapping = {
      Infrastructure: "Road Department",
      "Public Safety": "Public Safety",
      Sanitation: "Water & Sanitation",
      Traffic: "Traffic Management",
      Environment: "Environmental Services",
      "Public Services": "Building & Permits",
    };
    return mapping[category || ""] || "General Services";
  };

  const canProceed = data.urgency && data.frequency;

  return (
    <div className="p-6 space-y-6">
      {/* Progress Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Processing Details
        </h2>
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-8 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
        </div>
        <p className="text-gray-600 text-sm">Stage 2 of 3</p>
      </div>

      {/* Filter Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Issue Classification
        </h3>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-blue-800">
              Category: {data.category}
            </span>
          </div>
          <p className="text-blue-600 text-sm">
            Automatically categorized by AI
          </p>
        </div>
      </div>

      {/* Urgency Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Urgency Level
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {urgencyLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onUpdate({ urgency: level.value })}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                data.urgency === level.value
                  ? level.color + " border-opacity-100"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-center">
                <p className="font-medium">{level.label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {level.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Frequency Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Issue Frequency
        </h3>

        <div className="space-y-3">
          {frequencyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdate({ frequency: option.value })}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                data.frequency === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    data.frequency === option.value
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {data.frequency === option.value && (
                    <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Department Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Department Assignment
        </h3>

        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Auto-assigned to: {getRecommendedDepartment(data.category)}
              </p>
              <p className="text-green-600 text-sm">
                Based on issue category and location
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() =>
              onUpdate({ assignedTo: getRecommendedDepartment(data.category) })
            }
            className="text-blue-600 text-sm underline"
          >
            Change department assignment
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4 pt-6">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <button
          onClick={() => {
            onUpdate({ assignedTo: getRecommendedDepartment(data.category) });
            onNext();
          }}
          disabled={!canProceed}
          className={`flex-1 p-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 ${
            canProceed
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <span>Next</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StageTwo;
