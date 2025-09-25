import React from "react";
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const Dashboard = ({ complaints, onNewComplaint, onViewComplaint }) => {
  const stats = {
    total: complaints.length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    pending: complaints.filter(
      (c) => c.status === "submitted" || c.status === "assigned"
    ).length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Issues</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolved</p>
              <p className="text-2xl font-bold">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* New Complaint Button */}
      <button
        onClick={onNewComplaint}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-2xl flex items-center justify-center space-x-2 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        <Plus className="w-6 h-6" />
        <span className="font-semibold">Report New Issue</span>
      </button>

      {/* Recent Complaints */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Reports</h2>
        <div className="space-y-4">
          {complaints.slice(0, 5).map((complaint) => (
            <div
              key={complaint.id}
              onClick={() => complaint.id && onViewComplaint(complaint.id)}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  {complaint.status
                    ? complaint.status.replace("-", " ").toUpperCase()
                    : ""}
                </span>
                <span
                  className={`text-xs font-medium ${getUrgencyColor(
                    complaint.urgency
                  )}`}
                >
                  {complaint.urgency ? complaint.urgency.toUpperCase() : ""}
                </span>
              </div>

              <p className="text-gray-800 font-medium mb-2 line-clamp-2">
                {complaint.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {complaint.location?.address || "Location not set"}
                  </span>
                </div>
                <span>
                  {complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>

              {complaint.status === "in-progress" &&
                complaint.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{complaint.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${complaint.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>

        {complaints.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No complaints yet</p>
            <p className="text-sm text-gray-400">
              Start by reporting your first issue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
