// it checks if the user is auth or not ig req.isAuthenticated() is from the client
// if not 401
// and next to the route handler if is authed
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  next();
};

// same but checks if the user is admin or not from req.user.role
export const requireAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required",
    });
  }

  next();
};
