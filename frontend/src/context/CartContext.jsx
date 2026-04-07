import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { apiClient, endpoints } from "../utils/api";

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
      const response = await apiClient.get(endpoints.cart.get);
      setCart(response.data || { items: [] });
      const count = response.data?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart:", error);
      // If unauthorized, clear token
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setCart({ items: [] });
      setCartCount(0);
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
      
      // Debug: Check if endpoint exists
      console.log("Add to cart endpoint:", endpoints.cart.add);
      console.log("Product ID:", productId);
      console.log("Quantity:", quantity);
      
      // Make sure endpoints.cart.add is a string
      const addEndpoint = endpoints.cart.add;
      if (typeof addEndpoint !== 'string') {
        console.error("Invalid cart add endpoint:", addEndpoint);
        alert("Configuration error: Invalid cart endpoint");
        return false;
      }
      
      const response = await apiClient.post(addEndpoint, { productId, quantity });
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
      const removeEndpoint = endpoints.cart.remove(productId);
      console.log("Remove endpoint:", removeEndpoint);
      const response = await apiClient.delete(removeEndpoint);
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

// Make sure these functions are defined in CartContext
const incrementQuantity = async (productId) => {
  if (!token) return false;

  try {
    setLoading(true);
    const response = await apiClient.put(endpoints.cart.update(productId), { 
      quantity: (cart.items.find(item => item.product === productId)?.quantity || 0) + 1 
    });
    await fetchCart();
    return true;
  } catch (error) {
    console.error("Error incrementing quantity:", error);
    return false;
  } finally {
    setLoading(false);
  }
};

const decrementQuantity = async (productId) => {
  if (!token) return false;

  try {
    setLoading(true);
    const currentItem = cart.items.find(item => item.product === productId);
    const newQuantity = (currentItem?.quantity || 0) - 1;
    
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      await apiClient.put(endpoints.cart.update(productId), { quantity: newQuantity });
      await fetchCart();
    }
    return true;
  } catch (error) {
    console.error("Error decrementing quantity:", error);
    return false;
  } finally {
    setLoading(false);
  }
};

// Make sure these are in the Context value
return (
  <CartContext.Provider value={{
    cart,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    incrementQuantity,  // ← Must be included
    decrementQuantity,  // ← Must be included
    clearCart,
    fetchCart
  }}>
    {children}
  </CartContext.Provider>
);

  const clearCart = async () => {
    if (!token) return false;

    try {
      setLoading(true);
      await apiClient.delete(endpoints.cart.clear);
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