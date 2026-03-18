import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  const checkPasswordStrength = (password) => {
    const strength = {
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    // Calculate score
    let score = 0;
    Object.values(strength).forEach(value => value && score++);
    
    setPasswordStrength({ ...strength, score });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
    
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError("Current password is required");
      return false;
    }
    
    if (!formData.newPassword) {
      setError("New password is required");
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        setError("You are not logged in. Please login again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
        return;
      }

      console.log("Sending request to change password..."); // Debug log
      
      const response = await API.post(
        "/admin/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Response:", response.data); // Debug log
      
      setSuccess("Password changed successfully!");
      
      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
      
    } catch (err) {
      console.error("Error details:", err.response || err); // Debug log
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
        
        // If unauthorized, redirect to login
        if (err.response.status === 401) {
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || "Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  const StrengthIndicator = () => {
    const colors = {
      0: "bg-gray-200",
      1: "bg-red-500",
      2: "bg-orange-500",
      3: "bg-yellow-500",
      4: "bg-green-500",
      5: "bg-green-600"
    };
    
    const labels = {
      0: "Very Weak",
      1: "Weak",
      2: "Fair",
      3: "Good",
      4: "Strong",
      5: "Very Strong"
    };

    return (
      <div className="mt-2">
        <div className="flex gap-1 h-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`flex-1 rounded-full transition-colors duration-300 ${
                level <= passwordStrength.score ? colors[level] : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs mt-1 text-gray-600">
          Strength: <span className="font-medium">{labels[passwordStrength.score]}</span>
        </p>
      </div>
    );
  };

  const PasswordRequirements = () => (
    <div className="mt-3 text-xs space-y-1">
      <p className="font-medium text-gray-700">Password requirements:</p>
      <ul className="space-y-1">
        <li className={`flex items-center gap-1 ${passwordStrength.hasLength ? "text-green-600" : "text-gray-500"}`}>
          {passwordStrength.hasLength ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          At least 8 characters
        </li>
        <li className={`flex items-center gap-1 ${passwordStrength.hasNumber ? "text-green-600" : "text-gray-500"}`}>
          {passwordStrength.hasNumber ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          At least one number
        </li>
        <li className={`flex items-center gap-1 ${passwordStrength.hasUpper ? "text-green-600" : "text-gray-500"}`}>
          {passwordStrength.hasUpper ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          At least one uppercase letter
        </li>
        <li className={`flex items-center gap-1 ${passwordStrength.hasLower ? "text-green-600" : "text-gray-500"}`}>
          {passwordStrength.hasLower ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          At least one lowercase letter
        </li>
        <li className={`flex items-center gap-1 ${passwordStrength.hasSpecial ? "text-green-600" : "text-gray-500"}`}>
          {passwordStrength.hasSpecial ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          At least one special character (!@#$%^&*)
        </li>
      </ul>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Lock className="text-red-600" size={24} />
              Change Password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update your admin account password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("current")}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("new")}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.newPassword && (
                <>
                  <StrengthIndicator />
                  <PasswordRequirements />
                </>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                      ? "border-red-500 bg-red-50"
                      : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword("confirm")}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChangePasswordModal;