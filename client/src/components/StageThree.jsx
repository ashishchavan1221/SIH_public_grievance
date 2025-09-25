import React, { useState } from "react";
import {
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Star,
  ArrowLeft,
  Send,
} from "lucide-react";

const StageThree = ({ data, complaints, onSubmit, onBack }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const finalData = {
      ...data,
      status: "submitted",
      progress: 10,
      updatedAt: new Date(),
    };

    onSubmit(finalData);
    setIsSubmitting(false);
  };

  const analytics = {
    totalComplaints: complaints.length,
    resolvedPercentage:
      Math.round(
        (complaints.filter((c) => c.status === "resolved").length /
          complaints.length) *
          100
      ) || 0,
    averageResolutionTime: "5.2 days",
    commonCategories: ["Infrastructure", "Public Safety", "Sanitation"],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Progress Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Final Review</h2>
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-8 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
        </div>
        <p className="text-gray-600 text-sm">Stage 3 of 3</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
          Complaint Summary
        </h3>

        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Category:</span>
            <p className="font-medium">{data.category}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Description:</span>
            <p className="font-medium">{data.description}</p>
          </div>
          <div className="flex space-x-6">
            <div>
              <span className="text-sm text-gray-600">Urgency:</span>
              <p className="font-medium capitalize">{data.urgency}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Frequency:</span>
              <p className="font-medium capitalize">
                {data.frequency?.replace("-", " ")}
              </p>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Assigned to:</span>
            <p className="font-medium">{data.assignedTo}</p>
          </div>
          {data.location && (
            <div>
              <span className="text-sm text-gray-600">Location:</span>
              <p className="font-medium">{data.location.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Module */}
      <div className="space-y-4">
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full text-lg font-semibold text-gray-800 flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Analytics Overview
          </div>
          <div
            className={`transform transition-transform ${
              showAnalytics ? "rotate-180" : ""
            }`}
          >
            ▼
          </div>
        </button>

        {showAnalytics && (
          <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.totalComplaints}
                </p>
                <p className="text-sm text-blue-800">Total Reports</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">
                  {analytics.resolvedPercentage}%
                </p>
                <p className="text-sm text-green-800">Resolved</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-gray-800">Common Categories:</p>
              <div className="flex flex-wrap gap-2">
                {analytics.commonCategories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800">
                Average Resolution Time:
              </p>
              <p className="text-lg font-bold text-orange-600">
                {analytics.averageResolutionTime}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expected Timeline */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl">
        <h4 className="font-semibold text-yellow-800 mb-2">
          Expected Timeline
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-yellow-700">Acknowledgment</span>
            <span className="text-sm text-yellow-600">Within 24 hours</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-yellow-700">Assignment</span>
            <span className="text-sm text-yellow-600">1-2 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-yellow-700">Resolution</span>
            <span className="text-sm text-yellow-600">3-7 days</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full p-4 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-300 ${
            isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              <span className="font-semibold text-lg">Submit Complaint</span>
            </>
          )}
        </button>

        <div className="flex space-x-4">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Success Message Preview */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-2xl">
        <div className="flex items-center space-x-3 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">What happens next?</span>
        </div>
        <ul className="text-sm text-green-700 space-y-1 ml-8">
          <li>• You'll receive a confirmation with tracking ID</li>
          <li>• Real-time updates on progress</li>
          <li>• Notification when resolved</li>
          <li>• Opportunity to provide feedback</li>
        </ul>
      </div>
    </div>
  );
};

export default StageThree;
