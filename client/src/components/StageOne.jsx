import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  Upload,
  ArrowLeft,
  ArrowRight,
  Zap,
  X,
} from "lucide-react";

// --- NEW CameraView Component ---
// This component handles the live camera feed and capture logic.
const CameraView = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Effect to start the camera stream when the component mounts
  useEffect(() => {
    let activeStream = null;

    const startCamera = async () => {
      try {
        // Request access to the user's camera
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Prefer the rear camera
        });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert(
          "Could not access the camera. Please check permissions and try again."
        );
        onClose(); // Close the view if camera access fails
      }
    };

    startCamera();

    // Cleanup function: This is crucial to stop the camera when the component unmounts
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onClose]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match the video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to a Base64 data URL
    const imageDataUrl = canvas.toDataURL("image/png");

    // Pass the captured image data back to the parent component
    onCapture(imageDataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {/* Hidden canvas used for capturing the frame */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 transition-colors"
        aria-label="Close camera"
      >
        <X size={24} />
      </button>

      {/* Capture button */}
      <div className="absolute bottom-10 flex justify-center w-full">
        <button
          onClick={handleCapture}
          className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white flex items-center justify-center group"
          aria-label="Capture photo"
        >
          <div className="w-16 h-16 bg-white rounded-full group-hover:bg-gray-200 transition-colors"></div>
        </button>
      </div>
    </div>
  );
};

// --- UPDATED StageOne Component ---
const StageOne = ({ data, onUpdate, onNext, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false); // State to control CameraView
  const fileInputRef = useRef(null);

  // This function now only handles uploads from the file input
  const handleImageUploadFromFile = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ image: e.target?.result });
        performAICategorization();
      };
      reader.readAsDataURL(file);
    }
  };

  // New handler for images captured by the CameraView component
  const handleCaptureFromCamera = (imageData) => {
    onUpdate({ image: imageData });
    performAICategorization();
    setIsCameraOpen(false); // Close the camera view after capture
  };

  const performAICategorization = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const categories = [
        "Infrastructure",
        "Public Safety",
        "Sanitation",
        "Traffic",
        "Environment",
        "Public Services",
      ];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      onUpdate({ category: randomCategory });
      setIsAnalyzing(false);
    }, 2000);
  };

  const getCurrentLocation = () => {
    setLocationError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mockAddress = `Lat: ${latitude.toFixed(
            4
          )}, Lon: ${longitude.toFixed(4)}`;
          onUpdate({ location: { latitude, longitude, address: mockAddress } });
        },
        (error) => {
          let errorMessage = "An unknown error occurred.";
          if (error.code === error.PERMISSION_DENIED)
            errorMessage =
              "Location access denied. Please enable it in your browser settings.";
          if (error.code === error.POSITION_UNAVAILABLE)
            errorMessage = "Location information is unavailable.";
          if (error.code === error.TIMEOUT)
            errorMessage = "Location request timed out.";
          setLocationError(errorMessage);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  const canProceed =
    data.description &&
    (data.image || (data.location && data.location.address));

  return (
    <>
      {/* Conditionally render the CameraView component */}
      {isCameraOpen && (
        <CameraView
          onCapture={handleCaptureFromCamera}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      <div className="p-6 space-y-6">
        {/* Progress Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Report Problem
          </h2>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
          </div>
          <p className="text-gray-600 text-sm">Stage 1 of 3</p>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Camera className="w-5 h-5 mr-2" /> Upload Picture
          </h3>
          <div>
            {data.image ? (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center">
                <img
                  src={data.image}
                  alt="Uploaded"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={() => onUpdate({ image: null, category: null })}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Remove and select another
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* <button onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 flex flex-col items-center justify-center space-y-3">
                  <Upload className="w-10 h-10 text-gray-400" />
                  <p className="text-gray-600 font-medium">Upload from device</p>
                </button> */}
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-300 flex flex-col items-center justify-center space-y-3"
                >
                  <Camera className="w-10 h-10 text-gray-400" />
                  <p className="text-gray-600 font-medium">Use Live Camera</p>
                </button>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUploadFromFile}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Location & Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <MapPin className="w-5 h-5 mr-2" /> Location & Description
          </h3>
          <button
            onClick={getCurrentLocation}
            className="w-full bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-100 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span>Use Current Location</span>
          </button>
          {locationError && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
              <p className="text-red-800 text-sm">{locationError}</p>
            </div>
          )}
          {data.location?.address && !locationError && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
              <p className="text-green-800 text-sm">
                📍 {data.location.address}
              </p>
            </div>
          )}
          <input
            type="text"
            placeholder="Or enter location manually..."
            value={data.location?.address || ""}
            onChange={(e) =>
              onUpdate({
                location: { ...data.location, address: e.target.value },
              })
            }
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Describe the issue in detail..."
            value={data.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        </div>
        <div className="space-y-3 font-roboto text-lg text-gray-800">
          <label
            htmlFor="problemType"
            className="block font-semibold text-gray-700 text-xl"
          >
            Choose a problem type:
          </label>
          <select
            id="problemType"
            name="problemType"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="">--Select an option--</option>
            <option value="road">🚧 Road Damage</option>
            <option value="water">💧 Water Supply Issue</option>
            <option value="electricity">⚡ Electricity Problem</option>
            <option value="waste">🗑️ Garbage/Waste Management</option>
            <option value="other">❓ Other</option>
          </select>
        </div>

        {/* AI Categorization */}
        {/* <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center"><Zap className="w-5 h-5 mr-2" /> AI Categorization</h3>
          {isAnalyzing ? (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center space-x-3"><div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div><span className="text-blue-800">Analyzing...</span></div>
          ) : data.category ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center space-x-3"><Zap className="w-5 h-5 text-green-600" /><span className="text-green-800 font-medium">Category: {data.category}</span></div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl"><p className="text-gray-600 text-sm">Upload an image to enable AI categorization</p></div>
          )}
        </div> */}

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
          onClick={onNext}
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
    </>
  );
};

// Main App component to tie everything together for a demo
export default function App() {
  const [stage, setStage] = useState(1);
  const [reportData, setReportData] = useState({
    image: null,
    location: null,
    description: "",
    category: null,
  });

  const handleUpdate = (newData) => {
    setReportData((prev) => ({ ...prev, ...newData }));
  };

  // Dummy components for other stages
  const StageTwo = ({ onBack }) => (
    <div className="p-6 text-center">
      <h2>Stage 2</h2>
      <button onClick={onBack} className="mt-4 bg-gray-200 p-2 rounded">
        Back
      </button>
    </div>
  );
  const StageThree = ({ onBack }) => (
    <div className="p-6 text-center">
      <h2>Stage 3</h2>
      <button onClick={onBack} className="mt-4 bg-gray-200 p-2 rounded">
        Back
      </button>
    </div>
  );

  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <StageOne
            data={reportData}
            onUpdate={handleUpdate}
            onNext={() => setStage(2)}
            onBack={() => alert("Already on first page")}
          />
        );
      case 2:
        return <StageTwo onBack={() => setStage(1)} />;
      case 3:
        return <StageThree onBack={() => setStage(2)} />;
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-8">
        {renderStage()}
      </div>
    </div>
  );
}
