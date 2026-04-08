import React,{ createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved token on mount
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    console.log("Login called with user data:", userData);
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUserData) => {
    console.log("Updating user data:", updatedUserData);
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
    const newUserData = { ...currentUser, ...updatedUserData };
    
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
    
    // Force a small delay to ensure state updates propagate
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};