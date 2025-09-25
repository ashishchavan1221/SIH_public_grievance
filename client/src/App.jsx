import React, { useState } from "react";
import {
  Home,
  Camera,
  MapPin,
  Filter,
  Clock,
  Building2,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
// file import
import Dashboard from "./components/Dashboard";
import StageOne from "./components/StageOne";
import StageTwo from "./components/StageTwo";
import StageThree from "./components/StageThree";
import Navigation from "./components/Navigation";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [complaintData, setComplaintData] = useState({
    description: "",
    status: "submitted",
    progress: 0,
    createdAt: new Date(),
  });
  const [complaints, setComplaints] = useState([
    {
      id: "1",
      description: "Pothole on Main Street causing traffic issues",
      category: "Infrastructure",
      status: "in-progress",
      urgency: "high",
      frequency: "ongoing",
      assignedTo: "Road Department",
      progress: 65,
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 86400000 * 1),
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        address: "Main Street, Downtown",
      },
    },
    {
      id: "2",
      description: "Street light not working at Park Avenue intersection",
      category: "Public Safety",
      status: "resolved",
      urgency: "medium",
      frequency: "first-time",
      assignedTo: "Electrical Department",
      progress: 100,
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: new Date(Date.now() - 86400000 * 2),
      location: {
        latitude: 40.7589,
        longitude: -73.9851,
        address: "Park Avenue & 5th Street",
      },
      feedback: {
        rating: 5,
        comment: "Fixed quickly, very satisfied!",
      },
    },
  ]);

  const updateComplaintData = (data) => {
    setComplaintData((prev) => ({ ...prev, ...data }));
  };

  const submitComplaint = (finalData) => {
    const newComplaint = {
      ...finalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    setComplaintData({
      description: "",
      status: "submitted",
      progress: 0,
      createdAt: new Date(),
    });
    setCurrentView("dashboard");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "stage1":
        return (
          <StageOne
            data={complaintData}
            onUpdate={updateComplaintData}
            onNext={() => setCurrentView("stage2")}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "stage2":
        return (
          <StageTwo
            data={complaintData}
            onUpdate={updateComplaintData}
            onNext={() => setCurrentView("stage3")}
            onBack={() => setCurrentView("stage1")}
          />
        );
      case "stage3":
        return (
          <StageThree
            data={complaintData}
            complaints={complaints}
            onSubmit={submitComplaint}
            onBack={() => setCurrentView("stage2")}
          />
        );
      default:
        return (
          <Dashboard
            complaints={complaints}
            onNewComplaint={() => setCurrentView("stage1")}
            onViewComplaint={(id) => {
              console.log("View complaint:", id);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-yellow-50">
      <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-2">
            CitizenConnect
          </h1>
          <p className="text-cyan-100 text-center text-sm">
            Your Voice, Our Priority
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1">{renderCurrentView()}</div>

        {/* Navigation */}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
}

export default App;
