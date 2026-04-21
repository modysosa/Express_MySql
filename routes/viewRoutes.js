const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register" });
});

router.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login" });
});

router.get("/logout", (req, res) => {
  // Clear any authentication cookies/session if needed
  res.clearCookie("authToken");
  res.redirect("/login");
});

router.get("/users", userController.getUsersView);
router.get("/profile", protect, userController.getProfileView);
router.get("/user/dashboard", protect, userController.getUserDashboard);

// Admin routes
router.get("/admin/dashboard", protect, userController.getAdminDashboard);
router.get("/admin/create-user", protect, userController.getCreateUserPage);
router.post("/admin/create-user", protect, userController.postCreateUser);
router.get("/admin/edit-user/:userId", protect, userController.getEditUserPage);
router.post("/admin/edit-user/:userId", protect, userController.postUpdateUser);
router.post(
  "/admin/delete-user/:userId",
  protect,
  userController.postDeleteUser,
);

module.exports = router;
