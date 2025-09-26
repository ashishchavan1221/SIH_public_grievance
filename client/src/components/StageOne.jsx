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

// --- CameraView Component ---
// Handles the live camera feed as an overlay.
const CameraView = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Prefer rear camera
        });
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert(
          "Could not access the camera. Please check your browser permissions."
        );
        onClose();
      }
    };

    startCamera();

    // Cleanup function to stop the camera when the component is unmounted
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/png");
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
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-3"
        aria-label="Close camera"
      >
        <X size={24} />
      </button>
      <div className="absolute bottom-10 flex justify-center w-full">
        <button
          onClick={handleCapture}
          className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 group"
          aria-label="Capture photo"
        >
          <div className="w-16 h-16 bg-white rounded-full group-hover:bg-gray-200 transition-colors"></div>
        </button>
      </div>
    </div>
  );
};

// --- StageOne Component ---
const StageOne = ({ data, onUpdate, onNext, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadTargetIndex, setUploadTargetIndex] = useState(0);
  const fileInputRef = useRef(null);

  const handleImageUploadFromFile = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...(data.images || [null, null, null])];
        newImages[uploadTargetIndex] = e.target.result;
        onUpdate({ images: newImages });
        performAICategorization();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureFromCamera = (imageData) => {
    const newImages = [...(data.images || [null, null, null])];
    newImages[uploadTargetIndex] = imageData;
    onUpdate({ images: newImages });
    performAICategorization();
    setIsCameraOpen(false);
  };

  // const performAICategorization = () => {
  //   if (data.category) return; // Don't re-categorize if one exists
  //   setIsAnalyzing(true);
  //   setTimeout(() => {
  //     const categories = ["Infrastructure", "Public Safety", "Sanitation", "Traffic", "Environment"];
  //     const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  //     onUpdate({ category: randomCategory });
  //     setIsAnalyzing(false);
  //   }, 1500);
  // };

  // **NEW**: State to hold categories fetched from the backend.
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // **NEW**: useEffect to fetch categories when the component mounts.
  useEffect(() => {
    // This function simulates fetching data from your backend API.
    const fetchCategoriesFromBackend = async () => {
      setIsLoadingCategories(true);
      // In a real app, you would use fetch:
      // const response = await fetch('http://your-backend-url/api/categories');
      // const data = await response.json();
      // setCategories(data);

      // For this example, we'll simulate it with a delay.
      setTimeout(() => {
        const backendCategories = [
          "🛣️ Potholes / Damaged Roads",
          "🗑️ Solid Waste / Garbage Accumulation",
          "💡 Streetlight Faulty",
          "🌳 Tree Falling",
          "💧 Water Logging",
          "💨 Pollution",
          "👉 Other",
        ];
        setCategories(backendCategories);
        setIsLoadingCategories(false);
      }, 1000); // Simulate 1-second network delay
    };
    fetchCategoriesFromBackend();
  }, []); // The empty array `[]` ensures this runs only once.

  const getCurrentLocation = () => {
    setLocationError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would use a geocoding service to get an address
          const mockAddress = `Lat: ${latitude.toFixed(
            4
          )}, Lon: ${longitude.toFixed(4)}`;
          onUpdate({ location: { latitude, longitude, address: mockAddress } });
        },
        (error) => {
          let errorMessage = "An unknown error occurred.";
          if (error.code === error.PERMISSION_DENIED)
            errorMessage = "Location access was denied.";
          if (error.code === error.POSITION_UNAVAILABLE)
            errorMessage = "Location info is unavailable.";
          setLocationError(errorMessage);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  // **FIXED**: Validation now correctly checks if description exists AND (at least one image is uploaded OR location is entered)
  const canProceed =
    data.description &&
    (data.images?.some((img) => img !== null) || data.location?.address);

  return (
    <>
      {isCameraOpen && (
        <CameraView
          onCapture={handleCaptureFromCamera}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Report Problem
          </h2>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
          </div>
          <p className="text-gray-600 text-sm">Step 1 of 2</p>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Camera className="w-5 h-5 mr-2" /> Upload Pictures (up to 3)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="relative aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center"
              >
                {data.images?.[index] ? (
                  <>
                    <img
                      src={data.images[index]}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        const newImages = [...data.images];
                        newImages[index] = null;
                        onUpdate({ images: newImages });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <button
                      onClick={() => {
                        setUploadTargetIndex(index);
                        fileInputRef.current?.click();
                      }}
                      className="p-3 bg-gray-100 rounded-full hover:bg-blue-100"
                      title="Upload from device"
                    >
                      <Upload className="w-6 h-6 text-gray-500" />
                    </button>
                    <button
                      onClick={() => {
                        setUploadTargetIndex(index);
                        setIsCameraOpen(true);
                      }}
                      className="p-3 bg-gray-100 rounded-full hover:bg-cyan-100"
                      title="Use live camera"
                    >
                      <Camera className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
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
            className="w-full bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-100"
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
            className="w-full p-3 border border-gray-300 rounded-xl"
          />
          <textarea
            placeholder="Describe the issue in detail..."
            value={data.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-xl resize-none"
            rows={4}
          />
        </div>

        {/* **NEW**: Manual Categorization Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Zap className="w-5 h-5 mr-2" /> Select a Category
          </h3>
          <select
            value={data.category || ""}
            onChange={(e) => onUpdate({ category: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            disabled={isLoadingCategories}
          >
            <option value="" disabled>
              {isLoadingCategories
                ? "Loading categories..."
                : "-- Please choose an option --"}
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 pt-6">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex-1 p-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${
              canProceed
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
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

export default StageOne;
