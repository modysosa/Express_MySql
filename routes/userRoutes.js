const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

// API routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getAllUsers);
router.get("/profile", protect, userController.getProfile);
router.post("/make-admin", protect, userController.makeAdmin);

// Admin API routes
router.post("/admin/create", protect, userController.createUserAdmin);
router.put("/admin/update/:userId", protect, userController.updateUserAdminAPI);
router.delete("/admin/delete/:userId", protect, userController.deleteUserAdmin);

module.exports = router;
