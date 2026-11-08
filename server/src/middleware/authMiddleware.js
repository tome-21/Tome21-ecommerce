
// it is auth middleware and check whether the user is authenticated from the req idk if there is isAuth fn on req if not it send 401
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  next();
};

// it checks both the user is authenticated and the user role 
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
