import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCart({ items: [] });
      setCartCount(0);
    }
  }, [token]);

  const fetchCart = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Cart fetched:", response.data);
      setCart(response.data);
      const count = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    if (!token) {
      alert("Please login first");
      return false;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Add to cart response:", response.data);
      await fetchCart();
      alert("Product added to cart successfully!");
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.message || "Failed to add to cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return false;

    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Remove from cart response:", response.data);
      await fetchCart();
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return false;

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/cart/update/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Update quantity response:", response.data);
      await fetchCart();
      return true;
    } catch (error) {
      console.error("Error updating quantity:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!token) return false;

    try {
      setLoading(true);
      await axios.delete("http://localhost:5000/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};