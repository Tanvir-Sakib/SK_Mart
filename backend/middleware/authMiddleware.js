const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("Auth middleware - Checking authorization");
  
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log("No authorization header");
    return res.status(401).json({ message: "No token provided" });
  }
  
  // Check if Bearer scheme
  if (!authHeader.startsWith('Bearer ')) {
    console.log("Invalid token format");
    return res.status(401).json({ message: "Invalid token format" });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("User authenticated:", req.user.id);
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;