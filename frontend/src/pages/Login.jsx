import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { apiClient, endpoints } from "../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login for:", email);
      
      const response = await apiClient.post(endpoints.auth.login, {
        email,
        password
      });

      console.log("Login response:", response.data);

      if (response.data.token) {
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        };
        login(response.data.token, userData);
        
        // Redirect based on role
        if (userData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;