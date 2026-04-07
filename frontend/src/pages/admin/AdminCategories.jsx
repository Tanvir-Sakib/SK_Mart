import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiClient, endpoints, getImageUrl } from "../../utils/api";
import "./Admin.css";

const AdminCategories = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(endpoints.categories.admin.getAll);
      console.log("Categories response:", response.data);
      
      // Ensure categories is an array
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, try to extract categories
        categoriesData = Object.values(response.data).filter(item => item && item._id) || [];
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.response?.data?.message || "Failed to fetch categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        await apiClient.put(
          endpoints.categories.admin.update(editingCategory._id),
          { name: categoryName }
        );
        alert("Category updated successfully!");
      } else {
        await apiClient.post(
          endpoints.categories.admin.create,
          { name: categoryName }
        );
        alert("Category created successfully!");
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      setError(error.response?.data?.message || "Error saving category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setLoading(true);
      try {
        await apiClient.delete(endpoints.categories.admin.delete(id));
        alert("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        setError(error.response?.data?.message || "Error deleting category");
        alert(error.response?.data?.message || "Cannot delete category with products");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  if (loading && categories.length === 0) {
    return <div className="loading">Loading categories...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Categories</h2>
        <p>{error}</p>
        <button onClick={fetchCategories}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Manage Categories</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Category</button>
      </div>

      {categories.length === 0 ? (
        <div className="no-data">
          <p>No categories found. Click "Add Category" to create one.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(category)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(category._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                  setCategoryName("");
                  setError(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;