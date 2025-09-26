import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  MapPin, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  X, 
  CheckCircle, 
  RefreshCw, 
  Loader 
} from "lucide-react";

// --- CameraView Component ---
// This component handles the live camera feed and is shown as an overlay.
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
        alert("Could not access the camera. Please check your browser permissions.");
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
    onCapture(imageDataUrl); // Send the captured image data back
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      <button onClick={onClose} className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-3" aria-label="Close camera">
        <X size={24} />
      </button>
      <div className="absolute bottom-10 flex justify-center w-full">
        <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-gray-400 group" aria-label="Capture photo">
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

  const performAICategorization = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const categories = ["Infrastructure", "Public Safety", "Sanitation", "Traffic", "Environment"];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      onUpdate({ category: randomCategory });
      setIsAnalyzing(false);
    }, 1500);
  };

  const getCurrentLocation = () => {
    setLocationError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mockAddress = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          onUpdate({ location: { latitude, longitude, address: mockAddress } });
        },
        (error) => {
          let errorMessage = "An unknown error occurred.";
          if (error.code === error.PERMISSION_DENIED) errorMessage = "Location access was denied.";
          if (error.code === error.POSITION_UNAVAILABLE) errorMessage = "Location info is unavailable.";
          setLocationError(errorMessage);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  const canProceed = data.description && (data.images?.some(img => img) || data.location?.address);

  return (
    <>
      {isCameraOpen && <CameraView onCapture={handleCaptureFromCamera} onClose={() => setIsCameraOpen(false)} />}
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Problem</h2>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
            <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
          </div>
          <p className="text-gray-600 text-sm">Stage 1 of 3</p>
        </div>
        
        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center"><Camera className="w-5 h-5 mr-2" /> Upload Pictures (up to 3)</h3>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative aspect-square border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
                {data.images?.[index] ? (
                  <>
                    <img src={data.images[index]} alt={`Upload ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                    <button onClick={() => { const newImages = [...data.images]; newImages[index] = null; onUpdate({ images: newImages, category: null }); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md" aria-label="Remove image"><X size={16} /></button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <button onClick={() => { setUploadTargetIndex(index); fileInputRef.current?.click(); }} className="p-3 bg-gray-100 rounded-full hover:bg-blue-100" title="Upload from device"><Upload className="w-6 h-6 text-gray-500" /></button>
                    <button onClick={() => { setUploadTargetIndex(index); setIsCameraOpen(true); }} className="p-3 bg-gray-100 rounded-full hover:bg-cyan-100" title="Use live camera"><Camera className="w-6 h-6 text-gray-500" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUploadFromFile} accept="image/*" className="hidden" />
        </div>

        {/* Location & Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center"><MapPin className="w-5 h-5 mr-2" /> Location & Description</h3>
          <button onClick={getCurrentLocation} className="w-full bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-100"><MapPin className="w-5 h-5" /><span>Use Current Location</span></button>
          {locationError && <div className="bg-red-50 border border-red-200 p-3 rounded-xl"><p className="text-red-800 text-sm">{locationError}</p></div>}
          {data.location?.address && !locationError && <div className="bg-green-50 border border-green-200 p-3 rounded-xl"><p className="text-green-800 text-sm">📍 {data.location.address}</p></div>}
          <input type="text" placeholder="Or enter location manually..." value={data.location?.address || ""} onChange={(e) => onUpdate({ location: { ...data.location, address: e.target.value } })} className="w-full p-3 border border-gray-300 rounded-xl" />
          <textarea placeholder="Describe the issue in detail..." value={data.description || ""} onChange={(e) => onUpdate({ description: e.target.value })} className="w-full p-4 border border-gray-300 rounded-xl resize-none" rows={4} />
        </div>
        
        {/* AI Categorization */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center"><Zap className="w-5 h-5 mr-2" /> AI Categorization</h3>
          {isAnalyzing ? (<div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center space-x-3"><div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div><span className="text-blue-800">Analyzing...</span></div>) : data.category ? (<div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center space-x-3"><Zap className="w-5 h-5 text-green-600" /><span className="text-green-800 font-medium">Category: {data.category}</span></div>) : (<div className="bg-gray-50 border border-gray-200 p-4 rounded-xl"><p className="text-gray-600 text-sm">Upload an image for AI categorization</p></div>)}
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-4 pt-6">
          <button onClick={onBack} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-200"><ArrowLeft className="w-5 h-5" /><span>Back</span></button>
          <button onClick={onNext} disabled={!canProceed} className={`flex-1 p-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${canProceed ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

// --- StageTwo (Confirmation) Component ---
const StageTwo = ({ data, onSave, onBack, isSubmitting }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Details</h2>
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
        </div>
        <p className="text-gray-600 text-sm">Stage 2 of 3</p>
      </div>
      <div className="space-y-4 text-left p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-bold text-lg">Review Your Report</h3>
        <p><strong>Category:</strong> {data.category || 'N/A'}</p>
        <p><strong>Location:</strong> {data.location?.address || 'N/A'}</p>
        <p><strong>Description:</strong> {data.description || 'N/A'}</p>
        <p><strong>Images Uploaded:</strong> {data.images?.filter(img => img).length || 0}</p>
      </div>
      <div className="flex space-x-4 pt-6">
        <button onClick={onBack} disabled={isSubmitting} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <button onClick={onSave} disabled={isSubmitting} className="flex-1 p-3 rounded-xl flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Save & Submit</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- StageThree (Success) Component ---
const StageThree = ({ onFinish }) => {
  return (
    <div className="p-6 space-y-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Complete</h2>
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
        </div>
        <p className="text-gray-600 text-sm">Stage 3 of 3</p>
      <div className="flex flex-col items-center space-y-4 pt-8">
        <CheckCircle className="w-20 h-20 text-green-500" />
        <p className="text-lg">Thank you! Your report has been submitted successfully.</p>
      </div>
      <div className="pt-12">
        <button onClick={onFinish} className="w-full p-3 rounded-xl flex items-center justify-center space-x-2 bg-green-500 text-white shadow-lg hover:bg-green-600">
          <span>File a New Report</span>
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};


// --- Main App Component ---
export default function App() {
  const initialData = {
    images: [null, null, null],
    location: null,
    description: "",
    category: null,
  };

  const [stage, setStage] = useState(1);
  const [reportData, setReportData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = (newData) => {
    setReportData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    console.log("Submitting report to the server...", reportData);

    // Simulate network delay (e.g., 2 seconds) for saving data
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Report submitted successfully!");
    setIsSubmitting(false);
    
    // Navigate to the final success stage
    setStage(3);
  };

  const handleReset = () => {
    setReportData(initialData);
    setStage(1);
  }

  const renderStage = () => {
    switch (stage) {
      case 1:
        return <StageOne data={reportData} onUpdate={handleUpdate} onNext={() => setStage(2)} onBack={() => alert("Already on the first page")} />;
      case 2:
        return <StageTwo data={reportData} onSave={handleSubmitReport} onBack={() => setStage(1)} isSubmitting={isSubmitting} />;
      case 3:
        return <StageThree onFinish={handleReset} />;
      default:
        return <StageOne data={reportData} onUpdate={handleUpdate} onNext={() => setStage(2)} onBack={() => alert("Already on the first page")} />;
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