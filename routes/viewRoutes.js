// View Routes
// Routes for rendering HTML pages

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// ==================== Public Routes ====================

/**
 * GET /
 * Home page - redirect to login
 */
router.get("/", (req, res) => {
  res.redirect("/login");
});

/**
 * GET /register
 * Registration page
 */
router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register" });
});

/**
 * GET /login
 * Login page
 */
router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login" });
});

/**
 * GET /logout
 * Logout and clear auth cookie
 */
router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.redirect("/login");
});

/**
 * GET /users
 * List of all users (public view)
 */
router.get("/users", userController.getUsersView);

// ==================== User Protected Routes ====================

/**
 * GET /profile
 * User profile page (requires authentication)
 */
router.get("/profile", protect, userController.getProfileView);

/**
 * GET /user/dashboard
 * User dashboard (requires authentication)
 */
router.get("/user/dashboard", protect, userController.getUserDashboard);

/**
 * GET /user/settings
 * User settings page (requires authentication)
 */
router.get("/user/settings", protect, userController.getUserSettingsPage);

/**
 * POST /user/settings
 * Update current user settings (requires authentication)
 */
router.post("/user/settings", protect, userController.postUserSettings);

// ==================== Admin Protected Routes ====================

/**
 * GET /admin/dashboard
 * Admin dashboard (requires authentication + admin role)
 */
router.get(
  "/admin/dashboard",
  protect,
  requireAdmin,
  adminController.getAdminDashboard,
);

/**
 * GET /admin/create-user
 * Create user page (requires authentication + admin role)
 */
router.get(
  "/admin/create-user",
  protect,
  requireAdmin,
  adminController.getCreateUserPage,
);

/**
 * POST /admin/create-user
 * Create user from form (requires authentication + admin role)
 */
router.post(
  "/admin/create-user",
  protect,
  requireAdmin,
  adminController.postCreateUser,
);

/**
 * GET /admin/edit-user/:userId
 * Edit user page (requires authentication + admin role)
 */
router.get(
  "/admin/edit-user/:userId",
  protect,
  requireAdmin,
  adminController.getEditUserPage,
);

/**
 * POST /admin/edit-user/:userId
 * Update user from form (requires authentication + admin role)
 */
router.post(
  "/admin/edit-user/:userId",
  protect,
  requireAdmin,
  adminController.postUpdateUser,
);

/**
 * POST /admin/delete-user/:userId
 * Delete user from form (requires authentication + admin role)
 */
router.post(
  "/admin/delete-user/:userId",
  protect,
  requireAdmin,
  adminController.postDeleteUser,
);

/**
 * GET /admin/users/:userId
 * View single user details (requires authentication + admin role)
 */
router.get(
  "/admin/users/:userId",
  protect,
  requireAdmin,
  adminController.getAdminUserDetailsPage,
);

/**
 * POST /admin/toggle-role/:userId
 * Toggle user role (requires authentication + admin role)
 */
router.post(
  "/admin/toggle-role/:userId",
  protect,
  requireAdmin,
  adminController.postToggleUserRole,
);

module.exports = router;
