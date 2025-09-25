import React, { useState, useRef } from "react";
import {
  Camera,
  MapPin,
  Upload,
  ArrowLeft,
  ArrowRight,
  Zap,
} from "lucide-react";

const StageOne = ({ data, onUpdate, onNext, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationError, setLocationError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ image: e.target?.result });
        // Simulate AI categorization
        performAICategorization();
      };
      reader.readAsDataURL(file);
    }
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
          const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onUpdate({
            location: {
              latitude,
              longitude,
              address: mockAddress,
            },
          });
        },
        (error) => {
          let errorMessage = "";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enter your location manually or enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information unavailable. Please enter your location manually.";
              break;
            case error.TIMEOUT:
              errorMessage =
                "Location request timed out. Please try again or enter your location manually.";
              break;
            default:
              errorMessage =
                "Unable to get your location. Please enter your location manually.";
              break;
          }
          setLocationError(errorMessage);
        }
      );
    } else {
      setLocationError(
        "Geolocation is not supported by this browser. Please enter your location manually."
      );
    }
  };

  const canProceed = data.description && (data.image || data.location);

  return (
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
          <Camera className="w-5 h-5 mr-2" />
          Upload Picture
        </h3>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
        >
          {data.image ? (
            <div className="space-y-4">
              <img
                src={data.image}
                alt="Uploaded"
                className="w-full h-48 object-cover rounded-xl"
              />
              <p className="text-green-600 font-medium">
                Image uploaded successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-600 font-medium">Tap to upload image</p>
                <p className="text-gray-400 text-sm">JPG, PNG up to 10MB</p>
              </div>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Location & Description
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

        {data.location && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
            <p className="text-green-800 text-sm">📍 {data.location.address}</p>
          </div>
        )}

        <input
          type="text"
          placeholder="Or enter location manually..."
          value={data.location?.address || ""}
          onChange={(e) =>
            onUpdate({
              location: {
                latitude: 0,
                longitude: 0,
                address: e.target.value,
              },
            })
          }
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <textarea
          placeholder="Describe the issue in detail..."
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
        />
      </div>

      {/* AI Categorization */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          AI Categorization
        </h3>

        {isAnalyzing ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-blue-800">Analyzing issue category...</span>
            </div>
          </div>
        ) : data.category ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Category: {data.category}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
            <p className="text-gray-600 text-sm">
              Upload an image to enable AI categorization
            </p>
          </div>
        )}
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
  );
};

export default StageOne;
