import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiClient } from "../../utils/api";
import "./Admin.css";

const AdminShippingSettings = () => {
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newFee, setNewFee] = useState("");
  const [editingCity, setEditingCity] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get("/api/admin/shipping-settings");
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load shipping settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedData) => {
    try {
      const response = await apiClient.put("/api/admin/shipping-settings", updatedData);
      setSettings(response.data.settings);
      setMessage("Settings updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update settings");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleThresholdChange = (e) => {
    const value = parseInt(e.target.value);
    updateSettings({ freeShippingThreshold: value });
  };

  const handleDefaultFeeChange = (e) => {
    const value = parseInt(e.target.value);
    updateSettings({ defaultFee: value });
  };

  const handleFreeShippingToggle = () => {
    updateSettings({ freeShippingEnabled: !settings.freeShippingEnabled });
  };

  const handleAddCity = async () => {
    if (!newCity || !newFee) {
      setError("Please enter both city name and fee");
      return;
    }
    
    try {
      const response = await apiClient.post("/api/admin/shipping-settings/city", {
        city: newCity,
        fee: parseInt(newFee)
      });
      setSettings(response.data.settings);
      setNewCity("");
      setNewFee("");
      setMessage("City added successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add city");
    }
  };

  const handleUpdateCity = async (cityId, fee) => {
    try {
      const response = await apiClient.put(`/api/admin/shipping-settings/city/${cityId}`, {
        fee: parseInt(fee)
      });
      setSettings(response.data.settings);
      setEditingCity(null);
      setMessage("City updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update city");
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (window.confirm("Delete this city rate?")) {
      try {
        const response = await apiClient.delete(`/api/admin/shipping-settings/city/${cityId}`);
        setSettings(response.data.settings);
        setMessage("City deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete city");
      }
    }
  };

  if (loading) return <div className="loading">Loading shipping settings...</div>;
  if (!settings) return <div className="error">Failed to load settings</div>;

  return (
    <div className="admin-container">
      <h1>Shipping Settings</h1>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {/* Free Shipping Settings */}
      <div className="settings-card">
        <h2>Free Shipping</h2>
        <div className="setting-group">
          <label>
            <input 
              type="checkbox" 
              checked={settings.freeShippingEnabled} 
              onChange={handleFreeShippingToggle}
            />
            Enable Free Shipping
          </label>
        </div>
        <div className="setting-group">
          <label>Free Shipping Threshold (৳)</label>
          <input 
            type="number" 
            value={settings.freeShippingThreshold} 
            onChange={handleThresholdChange}
            min="0"
            step="500"
          />
          <p className="hint">Orders above this amount get free shipping</p>
        </div>
      </div>
      
      {/* Default Shipping Fee */}
      <div className="settings-card">
        <h2>Default Shipping Fee</h2>
        <div className="setting-group">
          <label>Default Fee for Unlisted Cities (৳)</label>
          <input 
            type="number" 
            value={settings.defaultFee} 
            onChange={handleDefaultFeeChange}
            min="0"
          />
        </div>
      </div>
      
      {/* City-based Shipping Rates */}
      <div className="settings-card">
        <h2>City-Based Shipping Rates</h2>
        
        <div className="add-city-form">
          <h3>Add New City Rate</h3>
          <div className="form-row">
            <input 
              type="text" 
              placeholder="City Name" 
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Shipping Fee (৳)" 
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              min="0"
            />
            <button onClick={handleAddCity}>Add City</button>
          </div>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>City</th>
              <th>Shipping Fee (৳)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings.cityRates.map((city) => (
              <tr key={city._id}>
                <td>{city.city}</td>
                <td>
                  {editingCity === city._id ? (
                    <input 
                      type="number" 
                      defaultValue={city.fee}
                      onBlur={(e) => handleUpdateCity(city._id, e.target.value)}
                      autoFocus
                    />
                  ) : (
                    `৳ ${city.fee}`
                  )}
                </td>
                <td>
                  <button 
                    className="edit-btn" 
                    onClick={() => setEditingCity(city._id)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteCity(city._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {settings.cityRates.length === 0 && (
          <p className="no-data">No city rates configured. Add your first city above.</p>
        )}
      </div>
      
      {/* Preview Section */}
      <div className="settings-card">
        <h2>Shipping Fee Preview</h2>
        <div className="preview-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Amount</th>
                <th>Shipping Fee (Dhaka)</th>
                <th>Shipping Fee (Other)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Less than ৳{settings.freeShippingThreshold}</td>
                <td>৳ {settings.cityRates.find(c => c.city === "Dhaka")?.fee || settings.defaultFee}</td>
                <td>৳ {settings.defaultFee}</td>
              </tr>
              <tr className="highlight">
                <td>৳{settings.freeShippingThreshold} or more</td>
                <td colSpan="3">FREE SHIPPING</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminShippingSettings;