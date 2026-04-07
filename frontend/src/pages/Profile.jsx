import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { apiClient, endpoints } from '../utils/api';

const Profile = () => {
  const { token, user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    console.log("Profile - User data from context:", user);
    
    // Try to get user from localStorage if context is empty
    if (!user) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log("Profile - Found user in localStorage:", parsedUser);
          setFormData(prev => ({
            ...prev,
            name: parsedUser.name || "",
            email: parsedUser.email || ""
          }));
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      console.log("Updating profile with:", { name: formData.name, email: formData.email });
      
      const response = await apiClient.put(endpoints.auth.updateProfile, {
        name: formData.name,
        email: formData.email
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Profile update response:", response.data);

      // Update user in context and localStorage
      const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { 
        ...currentUser, 
        name: formData.name, 
        email: formData.email 
      };
      
      login(token, updatedUser);
      
      setMessage("Profile updated successfully!");
      
      // Refresh page after 1 second to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error("Profile update error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword) {
      setError("Please enter your current password");
      return;
    }
    
    if (!formData.newPassword) {
      setError("Please enter a new password");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      console.log("Changing password...");
      
      const response = await apiClient.put(endpoints.auth.changePassword, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Password change response:", response.data);
      
      setMessage("Password changed successfully!");
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      // Optional: Logout user after password change to force re-login
      // setTimeout(() => {
      //   logout();
      //   navigate("/login");
      // }, 2000);
      
    } catch (err) {
      console.error("Password change error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking user
  if (!token) {
    return <div className="loading">Please login to access profile...</div>;
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      
      <div className="profile-sections">
        {/* Profile Information Section */}
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
              />
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;