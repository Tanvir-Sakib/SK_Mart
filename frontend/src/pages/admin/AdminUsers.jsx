import React,{ useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiClient, endpoints } from "../../utils/api";
import "./Admin.css";

const AdminUsers = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check what the endpoint is
      console.log("Admin users endpoint:", endpoints.admin.users.getAll);
      
      const response = await apiClient.get(endpoints.admin.users.getAll);
      console.log("Users response:", response.data);
      
      // Ensure users is an array
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract users from the object
        usersData = response.data.users || Object.values(response.data).filter(item => item && item._id) || [];
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await apiClient.put(
        endpoints.admin.users.updateRole(userId),
        { role }
      );
      alert("User role updated successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert(error.response?.data?.message || "Failed to update user role");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiClient.delete(endpoints.admin.users.delete(userId));
        alert("User deleted successfully!");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Users</h2>
        <p>{error}</p>
        <button onClick={fetchUsers}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Manage Users</h1>

      {!users || users.length === 0 ? (
        <div className="no-data">
          <p>No users found.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>
                  <select
                    value={user.role || "user"}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteUser(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;