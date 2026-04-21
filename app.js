const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

// Config & Constants
dotenv.config();
const authConfig = require("./config/authConfig");
const db = require("./config/db");
const authService = require("./services/authService");

// Middleware
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const docsRoutes = require("./routes/docsRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();

// ==================== View Engine Setup ====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==================== Body Parser & Cookie Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Shared view locals for navbar and basic flash messages
app.use((req, res, next) => {
  const success =
    typeof req.query.success === "string" ? req.query.success : null;
  const error = typeof req.query.error === "string" ? req.query.error : null;

  res.locals.flash = { success, error };
  res.locals.currentUser = null;

  const token = req.cookies ? req.cookies.authToken : null;
  if (!token) {
    return next();
  }

  try {
    res.locals.currentUser = authService.verifyToken(token);
  } catch (err) {
    const cookieConfig = authService.getCookieConfig();
    res.clearCookie(cookieConfig.name);
  }

  return next();
});

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

// ==================== View Routes ====================
/**
 * Authentication views (public)
 * GET /register
 * GET /login
 * GET /logout
 *
 * User views (protected)
 * GET /profile
 * GET /user/dashboard
 * GET /users
 *
 * Admin views (protected + admin only)
 * GET /admin/dashboard
 * GET /admin/create-user
 * POST /admin/create-user
 * GET /admin/edit-user/:userId
 * POST /admin/edit-user/:userId
 * POST /admin/delete-user/:userId
 */
app.use("/", viewRoutes);

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
      console.log(`🚀 Server running on http://localhost:${PORT}/login`);
      console.log(`📝 Docs:`);
      console.log(`   - Register: POST /api/auth/register`);
      console.log(`   - Login: POST /api/auth/login`);
      console.log(`   - Admin: GET /admin/dashboard`);
      console.log(`   - Swagger UI: GET /api-docs`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
