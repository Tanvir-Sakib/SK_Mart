import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { apiClient, endpoints } from '../../utils/api';
import "./Admin.css";

const AdminCategories = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(endpoints.admin.categories, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiClient.put(
          `${endpoints.admin.categories}/${editingCategory._id}`,
          { name: categoryName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await apiClient.post(
          endpoints.admin.categories,
          { name: categoryName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      setEditingCategory(null);
      setCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.message || "Error saving category");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await apiClient.delete(`${endpoints.admin.categories}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Cannot delete category with products");
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading categories...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Manage Categories</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Category</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Products Count</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.name}</td>
              <td>{category.productCount || 0}</td>
              <td>{new Date(category.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(category)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(category._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                  setCategoryName("");
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;