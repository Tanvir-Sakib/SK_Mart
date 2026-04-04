const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Auth middleware called for:", req.method, req.path);
  
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log("No authorization header");
      return res.status(401).json({ message: "No token provided" });
    }
    
    // Check if header has Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      console.log("Invalid token format");
      return res.status(401).json({ message: "Invalid token format" });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log("No token in header");
      return res.status(401).json({ message: "No token provided" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("User authenticated:", req.user);
    
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authMiddleware;