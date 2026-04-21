// Admin Controller
// Admin-only operations for managing users

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const authService = require("../services/authService");
const userService = require("../services/userService");
const userValidator = require("../validators/userValidator");
const authValidator = require("../validators/authValidator");
const AppError = require("../utils/appError");

const parseIsAdmin = (value) =>
  value === true ||
  value === "true" ||
  value === "on" ||
  value === 1 ||
  value === "1";

// ==================== API Routes ====================

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
const createUserAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;

  // Validate input
  userValidator.validateUserCreation(name, email, password);

  // Create user
  const user = await userService.createUser(
    name,
    email,
    await authService.hashPassword(password),
    parseIsAdmin(isAdmin),
  );

  return sendSuccess(res, 201, "User created successfully", {
    user: authService.getSafeUserResponse(user),
  });
});

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
const getAllUsersAdmin = asyncHandler(async (req, res, next) => {
  const users = await userService.getAllUsers();
  const safeUsers = users.map((u) => authService.getSafeUserResponse(u));

  return sendSuccess(res, 200, "Users retrieved successfully", {
    users: safeUsers,
  });
});

/**
 * GET /api/admin/users/:userId
 * Get single user by ID (admin only)
 */
const getUserAdmin = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userService.getUserById(userId);

  return sendSuccess(res, 200, "User retrieved successfully", {
    user: authService.getSafeUserResponse(user),
  });
});

/**
 * PUT /api/admin/users/:userId
 * Update user (admin only)
 */
const updateUserAdmin = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  // Validate input
  userValidator.validateUserUpdate(name, email);

  // Update basic info
  let user = await userService.updateUser(userId, name, email);

  // Update password if provided
  if (password) {
    authValidator.validatePassword(password);
    const hashedPassword = await authService.hashPassword(password);
    await userService.updateUserPassword(userId, hashedPassword);
    user = await userService.getUserById(userId);
  }

  return sendSuccess(res, 200, "User updated successfully", {
    user: authService.getSafeUserResponse(user),
  });
});

/**
 * DELETE /api/admin/users/:userId
 * Delete user (admin only)
 */
const deleteUserAdmin = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  await userService.deleteUser(userId, req.user.id);

  return sendSuccess(res, 200, "User deleted successfully");
});

/**
 * PUT /api/admin/users/:userId/role
 * Promote/demote user admin status (admin only)
 */
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { isAdmin } = req.body;
  const parsedIsAdmin = parseIsAdmin(isAdmin);

  if (
    typeof isAdmin === "string" &&
    !["true", "false", "on", "1", "0"].includes(isAdmin.toLowerCase())
  ) {
    throw new AppError("isAdmin must be a boolean", 400);
  }

  const user = await userService.updateUserAdmin(userId, parsedIsAdmin);

  return sendSuccess(res, 200, "User role updated successfully", {
    user: authService.getSafeUserResponse(user),
  });
});

// ==================== View Routes ====================

/**
 * GET /admin/dashboard
 * Admin dashboard (view)
 */
const getAdminDashboard = asyncHandler(async (req, res, next) => {
  const query = (req.query.q || "").trim().toLowerCase();
  const users = await userService.getAllUsers();
  const filteredUsers = query
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      )
    : users;

  return res.render("admin/dashboard", {
    title: "Admin Dashboard",
    users: filteredUsers,
    query,
    totalUsers: users.length,
  });
});

/**
 * GET /admin/create-user
 * Create user page (view)
 */
const getCreateUserPage = asyncHandler(async (req, res, next) => {
  return res.render("admin/create-user", {
    title: "Create User",
    currentUser: req.user,
  });
});

/**
 * POST /admin/create-user
 * Create user from form (view)
 */
const postCreateUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;

  // Validate input
  userValidator.validateUserCreation(name, email, password);

  // Create user
  await userService.createUser(
    name,
    email,
    await authService.hashPassword(password),
    parseIsAdmin(isAdmin),
  );

  return res.redirect("/admin/dashboard?success=User%20created%20successfully");
});

/**
 * GET /admin/edit-user/:userId
 * Edit user page (view)
 */
const getEditUserPage = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await userService.getUserById(userId);

  return res.render("admin/edit-user", {
    title: "Edit User",
    user,
    currentUser: req.user,
  });
});

/**
 * POST /admin/edit-user/:userId
 * Update user from form (view)
 */
const postUpdateUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  // Validate input
  userValidator.validateUserUpdate(name, email);

  // Update basic info
  await userService.updateUser(userId, name, email);

  // Update password if provided
  if (password) {
    authValidator.validatePassword(password);
    const hashedPassword = await authService.hashPassword(password);
    await userService.updateUserPassword(userId, hashedPassword);
  }

  return res.redirect("/admin/dashboard?success=User%20updated%20successfully");
});

/**
 * POST /admin/delete-user/:userId
 * Delete user from form (view)
 */
const postDeleteUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  await userService.deleteUser(userId, req.user.id);

  return res.redirect("/admin/dashboard?success=User%20deleted%20successfully");
});

/**
 * GET /admin/users/:userId
 * View single user details (view)
 */
const getAdminUserDetailsPage = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  return res.render("admin/user-details", {
    title: "User Details",
    user,
  });
});

/**
 * POST /admin/toggle-role/:userId
 * Toggle a user's admin role from dashboard (view)
 */
const postToggleUserRole = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const targetUser = await userService.getUserById(userId);

  if (Number(targetUser.id) === Number(req.user.id)) {
    throw new AppError("You cannot change your own admin role", 400);
  }

  await userService.updateUserAdmin(userId, !targetUser.admin);

  return res.redirect("/admin/dashboard?success=User%20role%20updated");
});

module.exports = {
  // API Routes
  createUserAdmin,
  getAllUsersAdmin,
  getUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  updateUserRole,

  // View Routes
  getAdminDashboard,
  getCreateUserPage,
  postCreateUser,
  getEditUserPage,
  postUpdateUser,
  postDeleteUser,
  getAdminUserDetailsPage,
  postToggleUserRole,
};
