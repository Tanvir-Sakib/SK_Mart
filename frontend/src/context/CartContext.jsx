import React,{ createContext, useState, useContext, useEffect } from "react";
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
      console.log("Cart fetched:", response.data);
      setCart(response.data || { items: [] });
      const count = response.data?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart:", error);
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
      const response = await apiClient.post(endpoints.cart.add, { productId, quantity });
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
      const response = await apiClient.delete(endpoints.cart.remove(productId));
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

  // FIXED: incrementQuantity function
  const incrementQuantity = async (productId) => {
    if (!token) return false;
    
    console.log("incrementQuantity called for:", productId);
    
    try {
      setLoading(true);
      // Find current item to get its quantity
      const currentItem = cart.items?.find(item => item.product?._id === productId || item.product === productId);
      const currentQuantity = currentItem?.quantity || 1;
      const newQuantity = currentQuantity + 1;
      
      const response = await apiClient.put(endpoints.cart.update(productId), { quantity: newQuantity });
      console.log("Increment response:", response.data);
      await fetchCart();
      return true;
    } catch (error) {
      console.error("Error incrementing quantity:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // FIXED: decrementQuantity function
  const decrementQuantity = async (productId) => {
    if (!token) return false;
    
    console.log("decrementQuantity called for:", productId);
    
    try {
      setLoading(true);
      // Find current item to get its quantity
      const currentItem = cart.items?.find(item => item.product?._id === productId || item.product === productId);
      const currentQuantity = currentItem?.quantity || 1;
      const newQuantity = currentQuantity - 1;
      
      if (newQuantity <= 0) {
        // If quantity becomes 0, remove the item
        await removeFromCart(productId);
      } else {
        const response = await apiClient.put(endpoints.cart.update(productId), { quantity: newQuantity });
        console.log("Decrement response:", response.data);
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
      incrementQuantity,
      decrementQuantity,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};