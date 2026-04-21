// Authentication Routes
// Public routes for register, login, logout

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", authController.registerUser);

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", authController.loginUser);

/**
 * POST /api/auth/logout
 * Logout user (clear cookie)
 * Protected route - user must be authenticated
 */
router.post("/logout", protect, authController.logoutUser);

module.exports = router;
