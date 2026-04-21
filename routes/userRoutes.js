// User Routes
// User-specific operations (profile, dashboard, etc.)

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

/**
 * GET /api/users/profile
 * Get current user profile (requires authentication)
 */
router.get("/profile", protect, userController.getProfile);

module.exports = router;
