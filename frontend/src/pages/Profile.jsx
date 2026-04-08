import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiClient, endpoints } from "../utils/api";

const Profile = () => {
  const { token, user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
    isDefault: false,
  });

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
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await apiClient.get("/api/auth/addresses");
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (editingAddress) {
        await apiClient.put(`/api/auth/addresses/${editingAddress._id}`, addressForm);
        setMessage("Address updated successfully!");
      } else {
        await apiClient.post("/api/auth/addresses", addressForm);
        setMessage("Address added successfully!");
      }
      
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        fullName: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
        email: "",
        isDefault: false,
      });
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Delete this address?")) {
      try {
        await apiClient.delete(`/api/auth/addresses/${addressId}`);
        fetchAddresses();
        setMessage("Address deleted!");
      } catch (err) {
        setError("Error deleting address");
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await apiClient.put(`/api/auth/addresses/${addressId}/default`);
      fetchAddresses();
      setMessage("Default address set!");
    } catch (err) {
      setError("Error setting default address");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode || "",
      phone: address.phone,
      email: address.email,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiClient.put(endpoints.auth.updateProfile, {
        name: formData.name,
        email: formData.email
      });
      updateUser({ name: formData.name, email: formData.email });
      setMessage("Profile updated successfully!");
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
      await apiClient.put(endpoints.auth.changePassword, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
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

  if (!user) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-sections">
        {/* Profile Information Section */}
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Profile"}</button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="profile-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
            </div>
            <button type="submit" disabled={loading}>{loading ? "Changing..." : "Change Password"}</button>
          </form>
        </div>

        {/* Saved Addresses Section */}
        <div className="profile-section addresses-section">
          <h2>Saved Addresses</h2>
          <button className="add-address-btn" onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm({ fullName: "", address: "", city: "", postalCode: "", phone: "", email: "", isDefault: false }); }}>
            + Add New Address
          </button>
          
          {addresses.length === 0 ? (
            <p className="no-addresses">No saved addresses. Add one for faster checkout!</p>
          ) : (
            <div className="addresses-list">
              {addresses.map((addr) => (
                <div key={addr._id} className={`address-card ${addr.isDefault ? "default" : ""}`}>
                  {addr.isDefault && <span className="default-badge">Default</span>}
                  <p><strong>{addr.fullName}</strong></p>
                  <p>{addr.address}</p>
                  <p>{addr.city}, {addr.postalCode}</p>
                  <p>📞 {addr.phone}</p>
                  <p>📧 {addr.email}</p>
                  <div className="address-actions">
                    <button onClick={() => handleEditAddress(addr)}>Edit</button>
                    {!addr.isDefault && <button onClick={() => handleSetDefaultAddress(addr._id)}>Set as Default</button>}
                    <button className="delete-btn" onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingAddress ? "Edit Address" : "Add New Address"}</h2>
            <form onSubmit={handleAddressSubmit}>
              <input type="text" name="fullName" placeholder="Full Name" value={addressForm.fullName} onChange={handleAddressChange} required />
              <input type="text" name="address" placeholder="Street Address" value={addressForm.address} onChange={handleAddressChange} required />
              <input type="text" name="city" placeholder="City" value={addressForm.city} onChange={handleAddressChange} required />
              <input type="text" name="postalCode" placeholder="Postal Code" value={addressForm.postalCode} onChange={handleAddressChange} />
              <input type="tel" name="phone" placeholder="Phone Number" value={addressForm.phone} onChange={handleAddressChange} required />
              <input type="email" name="email" placeholder="Email" value={addressForm.email} onChange={handleAddressChange} required />
              <label>
                <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                Set as default address
              </label>
              <div className="modal-buttons">
                <button type="submit" disabled={loading}>Save</button>
                <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;