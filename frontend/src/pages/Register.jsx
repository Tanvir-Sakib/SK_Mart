import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { apiClient, endpoints } from "../utils/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting registration for:", email);
      
      // Step 1: Register
      const registerResponse = await apiClient.post(endpoints.auth.register, {
        name,
        email,
        password
      });

      console.log("Registration response:", registerResponse.data);

      if (registerResponse.data.success) {
        // Step 2: Auto login after successful registration
        console.log("Registration successful, attempting auto-login...");
        
        const loginResponse = await apiClient.post(endpoints.auth.login, {
          email,
          password
        });

        console.log("Login response:", loginResponse.data);

        if (loginResponse.data.token) {
          const userData = {
            id: loginResponse.data.id,
            name: loginResponse.data.name,
            email: loginResponse.data.email,
            role: loginResponse.data.role
          };
          login(loginResponse.data.token, userData);
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).join(", "));
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;