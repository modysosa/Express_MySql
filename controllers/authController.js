// Authentication Controller
// Handles registration, login, and logout

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const authService = require("../services/authService");
const userService = require("../services/userService");
const authValidator = require("../validators/authValidator");
const AppError = require("../utils/appError");
const AUTH = require("../constants/authConstants");

/**
 * POST /api/auth/register
 * Register a new user
 */
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate input
  authValidator.validateRegistration(name, email, password);

  // Create user (throws if email exists)
  const user = await userService.createUser(
    name,
    email,
    await authService.hashPassword(password),
    false, // New users are not admins
  );

  // Generate token
  const { token } = authService.generateToken(user);

  // Set cookie
  const cookieConfig = authService.getCookieConfig();
  res.cookie(cookieConfig.name, token, cookieConfig.options);

  // Send response
  return sendSuccess(res, 201, AUTH.MESSAGES.AUTH.REGISTRATION_SUCCESS, {
    token,
    user: authService.getSafeUserResponse(user),
  });
});

/**
 * POST /api/auth/login
 * Login user with email and password
 */
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  authValidator.validateLogin(email, password);

  // Find user by email
  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw new AppError(AUTH.MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
  }

  // Compare password
  const isPasswordValid = await authService.comparePassword(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError(AUTH.MESSAGES.AUTH.INVALID_CREDENTIALS, 401);
  }

  // Generate token
  const { token } = authService.generateToken(user);

  // Set cookie
  const cookieConfig = authService.getCookieConfig();
  res.cookie(cookieConfig.name, token, cookieConfig.options);

  // Send response
  return sendSuccess(res, 200, AUTH.MESSAGES.AUTH.LOGIN_SUCCESS, {
    token,
    user: authService.getSafeUserResponse(user),
  });
});

/**
 * POST /api/auth/logout
 * Logout user (clear cookie)
 */
const logoutUser = asyncHandler(async (req, res, next) => {
  const cookieConfig = authService.getCookieConfig();
  res.clearCookie(cookieConfig.name);

  return sendSuccess(res, 200, AUTH.MESSAGES.AUTH.LOGOUT_SUCCESS);
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
