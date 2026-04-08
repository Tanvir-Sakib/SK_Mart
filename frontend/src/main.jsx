import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";  // ← Add this import
import { Toaster } from "react-hot-toast";
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>  {/* ← Wrap with CartProvider */}
        <App />
        <Toaster />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);