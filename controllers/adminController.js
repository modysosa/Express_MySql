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

module.exports = {
  createUserAdmin,
  getAllUsersAdmin,
  getUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  updateUserRole,
};
