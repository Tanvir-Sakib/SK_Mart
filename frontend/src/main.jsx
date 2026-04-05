import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import App from './App.jsx'
import './index.css'  // This imports Tailwind

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
    <Toaster />
  </AuthProvider>
);
