// Must be used AFTER authMiddleware (protect), since it relies on req.user
// Restricts a route to users whose role is "admin"
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no user found on request",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  next();
};

module.exports = adminOnly;
