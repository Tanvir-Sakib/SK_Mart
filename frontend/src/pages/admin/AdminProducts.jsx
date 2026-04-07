import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { formatPrice } from "../../utils/currency";
import "./Admin.css";
import { apiClient, endpoints } from '../../utils/api';

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

// In fetchProducts function
  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(endpoints.products.admin.getAll);
      // Ensure products is an array
      const productsData = Array.isArray(response.data) ? response.data : 
                          (response.data.products ? response.data.products : []);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(endpoints.admin.categories, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
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
  
  try {
    if (editingProduct) {
      // UPDATE EXISTING PRODUCT - Image is optional
      // Ensure stock and price are numbers
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10),
      };
      
      // Validate numbers
      if (isNaN(productData.price) || productData.price <= 0) {
        alert("Please enter a valid price");
        return;
      }
      
      if (isNaN(productData.stock) || productData.stock < 0) {
        alert("Please enter a valid stock quantity");
        return;
      }
      
      console.log("Sending update data:", productData);
      
      // Only upload image if a new file was selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);
        
        const uploadResponse = await apiClient.post(endpoints.upload, uploadData, {
          headers: { 
            Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
        productData.image = uploadResponse.data.imageUrl;
      }
      
      const response = await apiClient.put(
        `${endpoints.admin.products}/${editingProduct._id}`,
        productData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          } 
        }
      );
      
      console.log("Update response:", response.data);
      alert("Product updated successfully!");
      
      // Close modal and refresh
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ title: "", description: "", price: "", category: "", stock: "" });
      setImageFile(null);
      setImagePreview("");
      fetchProducts();
      
    } else {
      // CREATE NEW PRODUCT - Image is required
      if (!imageFile) {
        alert("Please select an image for the product");
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("price", parseFloat(formData.price));
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", parseInt(formData.stock, 10));
      formDataToSend.append("image", imageFile);
      
      console.log("Creating new product");
      
      
      const response = await apiClient.post(endpoints.admin.products, formDataToSend, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );
      
      console.log("Create response:", response.data);
      alert("Product created successfully!");
      
      // Close modal and refresh
      setShowModal(false);
      setFormData({ title: "", description: "", price: "", category: "", stock: "" });
      setImageFile(null);
      setImagePreview("");
      fetchProducts();
    }
    
  } catch (error) {
    console.error("Error saving product:", error);
    console.error("Error response:", error.response?.data);
    alert(error.response?.data?.message || "Error saving product");
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.delete(`${endpoints.admin.products}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Product deleted successfully!");
        fetchProducts();
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
    setImagePreview(getImageUrl(product.image));
    setImageFile(null); // Reset file input
    setShowModal(true);
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Manage Products</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Product</button>
      </div>

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
                  className="product-thumb" 
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/50x50?text=No+Image";
                  }}
                />
              </td>
              <td>{product.title}</td>
              <td> {formatPrice(product.price)}</td>
              <td className={product.stock < 10 ? "low-stock" : ""}>{product.stock}</td>
              <td>{product.category?.name || "Uncategorized"}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
                rows="4"
              />

              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                step="0.01"
                min="0"
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
              
              {/* Image Upload */}
              <div className="image-upload">
                <label>
                  Product Image 
                  {editingProduct && " (Leave empty to keep current image)"}
                  {!editingProduct && " *"}
                </label>
                
                {/* Show current image when editing */}
                {editingProduct && imagePreview && !imageFile && (
                  <div className="current-image">
                    <p>Current Image:</p>
                    <img 
                      src={imagePreview} 
                      alt="Current" 
                      className="current-image-preview" 
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                
                {/* Show new image preview */}
                {imageFile && imagePreview && (
                  <div className="image-preview">
                    <p>New Image Preview:</p>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  {editingProduct ? "Update" : "Save"}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({ title: "", description: "", price: "", category: "", stock: "" });
                    setImageFile(null);
                    setImagePreview("");
                  }}
                >
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

export default AdminProducts;