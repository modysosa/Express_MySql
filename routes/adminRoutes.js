// Admin Routes
// Admin-only routes for user management and admin dashboard

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// ==================== API Routes ====================
// All routes require authentication and admin role

/**
 * POST /api/admin/users
 * Create a new user
 */
router.post("/users", protect, requireAdmin, adminController.createUserAdmin);

/**
 * GET /api/admin/users
 * Get all users
 */
router.get("/users", protect, requireAdmin, adminController.getAllUsersAdmin);

/**
 * GET /api/admin/users/:userId
 * Get single user by ID
 */
router.get(
  "/users/:userId",
  protect,
  requireAdmin,
  adminController.getUserAdmin,
);

/**
 * PUT /api/admin/users/:userId
 * Update user (name, email)
 */
router.put(
  "/users/:userId",
  protect,
  requireAdmin,
  adminController.updateUserAdmin,
);

/**
 * DELETE /api/admin/users/:userId
 * Delete user
 */
router.delete(
  "/users/:userId",
  protect,
  requireAdmin,
  adminController.deleteUserAdmin,
);

/**
 * PUT /api/admin/users/:userId/role
 * Update user role (promote/demote admin)
 */
router.put(
  "/users/:userId/role",
  protect,
  requireAdmin,
  adminController.updateUserRole,
);

module.exports = router;
