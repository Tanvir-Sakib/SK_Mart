import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { apiClient, endpoints, getImageUrl } from "../../utils/api";
import "./Admin.css";

const AdminProducts = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);
      console.log("Fetching products from admin endpoint...");
      const response = await apiClient.get(endpoints.products.admin.getAll);
      console.log("Products response:", response.data);
      
      // Handle different response formats
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract any array property
        productsData = Object.values(response.data).find(val => Array.isArray(val)) || [];
      }
      
      console.log("Processed products:", productsData.length);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(endpoints.categories.admin.getAll);
      console.log("Categories response:", response.data);
      
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
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
    setLoading(true);
    setError(null);

    try {
      if (editingProduct) {
        // UPDATE PRODUCT
        const productData = {
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          stock: Number(formData.stock),
        };
        
        if (imageFile) {
          // Upload image first
          const uploadData = new FormData();
          uploadData.append("image", imageFile);
          
          const uploadResponse = await apiClient.post(endpoints.upload, uploadData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          productData.image = uploadResponse.data.imageUrl;
        }
        
        await apiClient.put(endpoints.products.admin.update(editingProduct._id), productData);
        alert("Product updated successfully!");
      } else {
        // CREATE PRODUCT
        if (!imageFile) {
          alert("Please select an image for the product");
          setLoading(false);
          return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("price", formData.price);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("stock", formData.stock);
        formDataToSend.append("image", imageFile);
        
        await apiClient.post(endpoints.products.admin.create, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Product created successfully!");
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ title: "", description: "", price: "", category: "", stock: "" });
      setImageFile(null);
      setImagePreview("");
      fetchProducts();
      
    } catch (error) {
      console.error("Error saving product:", error);
      setError(error.response?.data?.message || "Error saving product");
      alert(error.response?.data?.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiClient.delete(endpoints.products.admin.delete(id));
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(error.response?.data?.message || "Error deleting product");
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
    setImageFile(null);
    setShowModal(true);
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Products</h2>
        <p>{error}</p>
        <button onClick={fetchProducts}>Try Again</button>
      </div>
    );
  }

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
                    className="product-thumb"
                    onError={(e) => e.target.src = "https://placehold.co/50x50?text=No+Image"}
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
            {error && <div className="error-message">{error}</div>}
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
                <label>Product Image {editingProduct ? "(Leave empty to keep current)" : "*"}</label>
                {editingProduct && imagePreview && !imageFile && (
                  <div className="current-image">
                    <p>Current Image:</p>
                    <img src={imagePreview} alt="Current" className="current-image-preview" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {imageFile && imagePreview && (
                  <div className="image-preview">
                    <p>New Image Preview:</p>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              
              <div className="modal-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  setFormData({ title: "", description: "", price: "", category: "", stock: "" });
                  setImageFile(null);
                  setImagePreview("");
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

export default AdminProducts;