import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { query } from "./config/db.js";
const app = express();
import cors from "cors";
const port = process.env.PORT || 5000;

import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productImageRoutes from "./routes/productImageRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// auth
import session from "express-session";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";

// admin
import adminOrderRoutes from "./routes/adminOrderRoutes.js";

// CRITICAL FIX: CORS must allow credentials (cookies/sessions) and your frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Change if your frontend runs elsewhere
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api", async (req, res) => {
  try {
    const result = await query("SELECT NOW()");
    res.json({
      message: "api running and Database connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection Failed" });
  }
});

// auth sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true if HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/product-images", productImageRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}/api`);
});
