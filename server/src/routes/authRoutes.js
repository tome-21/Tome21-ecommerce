import express from "express";
import passport from "../config/passport.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — starts Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// Public — Google redirects here after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  },
);

// Protected — only logged-in users
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

// Logout
router.post("/logout", requireAuth, (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie("connect.sid");

      return res.status(200).json({
        message: "Logged out successfully",
      });
    });
  });
});

export default router;
