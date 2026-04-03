const adminMiddleware = (req, res, next) => {
  console.log("Admin middleware called");
  console.log("User role:", req.user?.role);
  
  if (!req.user) {
    console.log("No user object found");
    return res.status(403).json({ message: "User not authenticated" });
  }
  
  if (req.user.role !== "admin") {
    console.log("User is not admin");
    return res.status(403).json({ message: "Admin access required" });
  }
  
  console.log("Admin access granted");
  next();
};

module.exports = adminMiddleware;