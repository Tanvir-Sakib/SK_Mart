import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiClient, endpoints } from "../utils/api";

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
    if (user) {
      setFormData({
        ...formData,
        name: user.name || "",
        email: user.email || ""
      });
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
      const response = await apiClient.put(
        endpoints.auth.updateProfile,
        {
          name: formData.name,
          email: formData.email
        }
      );

      // Update user in context and localStorage
      const updatedUser = { ...user, name: formData.name, email: formData.email };
      login(token, updatedUser);
      
      setMessage("Profile updated successfully!");
      
      // Reload to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
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
      const response = await apiClient.put(
        endpoints.auth.changePassword,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      );

      setMessage("Password changed successfully!");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-sections">
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
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

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