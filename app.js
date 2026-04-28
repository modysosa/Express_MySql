const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Config & Constants
dotenv.config();
const authConfig = require("./config/authConfig");
const db = require("./config/db");

// Middleware
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const docsRoutes = require("./routes/docsRoutes");

const app = express();

// ==================== Body Parser & Cookie Middleware ====================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==================== Custom Error Handler for JSON Parsing ====================
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }
  next();
});

// ==================== Log Configuration in Development ====================
authConfig.logConfig();

// ==================== API Routes ====================
/**
 * Authentication routes (public)
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/logout
 */
app.use("/api/auth", authRoutes);

/**
 * User routes (protected)
 * GET /api/users/profile
 */
app.use("/api/users", userRoutes);

/**
 * Admin routes (protected + admin only)
 * POST /api/admin/users
 * GET /api/admin/users
 * GET /api/admin/users/:userId
 * PUT /api/admin/users/:userId
 * DELETE /api/admin/users/:userId
 * PUT /api/admin/users/:userId/role
 */
app.use("/api/admin", adminRoutes);
app.use("/", docsRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Backend is running" });
});

// ==================== Centralized Error Handler ====================
// MUST be last middleware - catches all errors from routes
app.use(errorHandler);

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==================== Start Server ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Connected to MySQL");
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Docs:`);
      console.log(`   - Register: POST /api/auth/register`);
      console.log(`   - Login: POST /api/auth/login`);
      console.log(`   - Profile: GET /api/users/profile`);
      console.log(`   - Swagger UI: GET /api-docs`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
