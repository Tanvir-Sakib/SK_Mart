import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";
import axios from "axios";
import "./Admin.css";

const AdminProducts = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products...");
      const response = await axios.get(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Products response:", response.data);
      
      // Handle different response formats
      let productsData = [];
      if (response.data && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }
      
      console.log("Products extracted:", productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Categories response:", response.data);
      const categoriesData = response.data.categories || response.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.stock) {
      alert("Please fill in all fields");
      return;
    }
    
    if (!editingProduct && !imageFile) {
      alert("Please select an image for the product");
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);
      
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }
      
      let url = `${API_URL}/api/admin/products`;
      let method = "POST";
      
      if (editingProduct) {
        url = `${API_URL}/api/admin/products/${editingProduct._id}`;
        method = "PUT";
      }
      
      console.log("Sending request to:", url);
      
      const response = await axios({
        method: method,
        url: url,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      console.log("Response:", response.data);
      alert(editingProduct ? "Product updated successfully!" : "Product created successfully!");
      
      // Close modal and reset form
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ title: "", description: "", price: "", category: "", stock: "" });
      setImageFile(null);
      setImagePreview("");
      
      // Refresh products list
      await fetchProducts();
      
    } catch (error) {
      console.error("Error saving product:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_URL}/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Product deleted successfully!");
        await fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category,
      stock: product.stock,
    });
    setImagePreview(product.image ? `${API_URL}${product.image}` : "");
    setImageFile(null);
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Manage Products</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Product</button>
      </div>

      {products.length === 0 ? (
        <div className="no-data">
          <p>No products found. Click "Add Product" to create one.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img 
                    src={getImageUrl(product.image)}
                    alt={product.title}
                  />
                </td>
                <td>{product.title}</td>
                <td>৳ {product.price}</td>
                <td className={product.stock < 10 ? "low-stock" : ""}>{product.stock}</td>
                <td>{product.category?.name || "N/A"}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows="3"
              />
              
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                step="0.01"
              />
              
              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
                min="0"
              />
              
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              
              <div className="image-upload">
                <label>Product Image {!editingProduct && "*"}</label>
                {editingProduct && imagePreview && !imageFile && (
                  <div className="current-image">
                    <p>Current Image:</p>
                    <img src={imagePreview} alt="Current" style={{ width: 100 }} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingProduct}
                />
                {imageFile && imagePreview && (
                  <div className="image-preview">
                    <p>Preview:</p>
                    <img src={imagePreview} alt="Preview" style={{ width: 100 }} />
                  </div>
                )}
              </div>
              
              <div className="modal-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  setFormData({ title: "", description: "", price: "", category: "", stock: "" });
                  setImageFile(null);
                  setImagePreview("");
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;