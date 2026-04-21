// User Controller
// User-specific operations (profile, dashboard, etc.)

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const authService = require("../services/authService");
const userService = require("../services/userService");
const userValidator = require("../validators/userValidator");
const authValidator = require("../validators/authValidator");

/**
 * GET /api/users/profile
 * Get current user profile (API)
 */
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  return sendSuccess(res, 200, "Profile retrieved successfully", {
    user: authService.getSafeUserResponse(user),
  });
});

/**
 * GET /profile
 * Get user profile page (view)
 */
const getProfileView = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  return res.render("user/profile", {
    title: "Profile",
    user,
  });
});

/**
 * GET /user/dashboard
 * Get user dashboard (view)
 */
const getUserDashboard = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  return res.render("user/dashboard", {
    title: "User Dashboard",
    user,
  });
});

/**
 * GET /users
 * Get all users list (public view - can be restricted if needed)
 */
const getUsersView = asyncHandler(async (req, res, next) => {
  const query = (req.query.q || "").trim().toLowerCase();
  const users = await userService.getAllUsers();
  const filteredUsers = query
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      )
    : users;

  return res.render("user/users", {
    title: "All Users",
    users: filteredUsers,
    query,
    totalUsers: users.length,
  });
});

/**
 * GET /user/settings
 * Settings page for current user
 */
const getUserSettingsPage = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  return res.render("user/settings", {
    title: "Account Settings",
    user,
  });
});

/**
 * POST /user/settings
 * Update own account information
 */
const postUserSettings = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const userId = req.user.id;

  userValidator.validateUserUpdate(name, email);
  await userService.updateUser(userId, name, email);

  if (password) {
    authValidator.validatePassword(password);
    const hashedPassword = await authService.hashPassword(password);
    await userService.updateUserPassword(userId, hashedPassword);
  }

  return res.redirect(
    "/user/settings?success=Account%20settings%20updated%20successfully",
  );
});

module.exports = {
  getProfile,
  getProfileView,
  getUserDashboard,
  getUsersView,
  getUserSettingsPage,
  postUserSettings,
};
