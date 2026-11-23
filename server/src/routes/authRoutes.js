import express from "express";
import passport from "../config/passport.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// this is the route to check if the use is loggedin idk what the scope is and call the passport authenticater
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// this the login route and after login if failed it redirect to the client url/login if loged in it redirect to client url
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  },
);


// it checkes if user is logedin if it send the userdata back 
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});


// it logout the user using the fn from the user req idk how if err it return the err if not it remove the session ig the cookie check err again and clear cookie named connect.sid
// and send success msg 
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
