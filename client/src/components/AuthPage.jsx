import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, Shield, CheckCircle } from "lucide-react";
import logo from "../../logo.png"; // Make sure this path is correct

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    aadhaar: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  // **NEW**: State to hold the success message after registration
  const [successMessage, setSuccessMessage] = useState("");
  const API_URL = "http://localhost:5000/api/auth";

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!isLogin) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.aadhaar) newErrors.aadhaar = "Aadhaar number is required";
      else if (!/^\d{12}$/.test(formData.aadhaar)) newErrors.aadhaar = "Please enter a valid 12-digit Aadhaar number";

      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(""); // Clear any previous success message
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            aadhaar: formData.aadhaar,
            email: formData.email,
            password: formData.password,
          };

      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ api: data.message || "Something went wrong" });
      } else {
        // **MODIFIED**: Handle login and registration success differently
        if (isLogin) {
          // If it was a login attempt, call the onLogin prop to proceed
          onLogin({ email: data.email, name: data.name, token: data.token });
        } else {
          // If it was a registration attempt, switch to the login view
          setSuccessMessage("Registration successful! Please sign in to continue.");
          setIsLogin(true);
          // Clear form fields for the login screen
          setFormData({
            name: "",
            aadhaar: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
        }
      }
    } catch (err) {
      setErrors({ api: "Server not reachable. Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation and success messages on new input
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (errors.api) setErrors((prev) => ({ ...prev, api: "" }));
    if (successMessage) setSuccessMessage("");
  };

  // Function to handle switching between Login and Register tabs
  const handleTabSwitch = (targetIsLogin) => {
    setIsLogin(targetIsLogin);
    setErrors({});
    setSuccessMessage("");
    setFormData({
      name: "",
      aadhaar: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-8 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-white p-2">
            <img src={logo} alt="NAGAR SETU Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-3xl font-bold">NAGAR SETU</p>
          <p className="text-cyan-100 text-sm mt-1">Bridging The Gap</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button type="button" onClick={() => handleTabSwitch(true)} className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}>
              <LogIn className="w-4 h-4 inline mr-2" /> Login
            </button>
            <button type="button" onClick={() => handleTabSwitch(false)} className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${!isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}>
              <UserPlus className="w-4 h-4 inline mr-2" /> Register
            </button>
          </div>

          {/* **NEW**: Display success message here */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-lg mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-3" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${errors.name ? "border-red-500" : "border-gray-300"}`} placeholder="Enter your full name" />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={formData.aadhaar} onChange={(e) => handleInputChange("aadhaar", e.target.value.replace(/\D/g, ''))} className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${errors.aadhaar ? "border-red-500" : "border-gray-300"}`} placeholder="Enter your 12-digit Aadhaar" maxLength="12" />
                </div>
                {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${errors.email ? "border-red-500" : "border-gray-300"}`} placeholder="Enter your email" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className={`w-full pl-12 pr-12 py-3 border rounded-xl transition-all ${errors.password ? "border-red-500" : "border-gray-300"}`} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`} placeholder="Confirm your password" />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}
            {errors.api && <p className="text-red-600 text-sm text-center font-medium mt-2">{errors.api}</p>}
            <button type="submit" disabled={isLoading} className={`w-full mt-4 py-4 rounded-xl font-semibold text-white transition-all duration-300 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-xl"}`}>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;