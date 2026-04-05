import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const Navbar = () => {
  const { token, user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🛍️ SK Mart</Link>
      </div>
      
      <div className="nav-links">
                {token ? (
          <>
            {/* Show Admin Panel link only for admin users */}
            {user?.role === "admin" && (
              <Link to="/admin" className="admin-link">Admin Panel</Link>
            )}
            <div className="user-info">
              <span className="user-name">👋 Hi, {user?.name || "User"} </span>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">🔐 Login</Link>
            <Link to="/register">📝 Register</Link>
          </>
        )}
        <Link to="/">🏠 Products</Link>
        
        {token && (
          <>
      
            <Link to="/orders">📋 My Orders</Link>
            <Link to="/cart" className="cart-link">
              🛒 Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/profile">👤 My Profile</Link>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;