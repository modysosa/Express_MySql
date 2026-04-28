// Role-Based Authorization Middleware

const AppError = require("../utils/appError");
const AUTH = require("../constants/authConstants");

/**
 * Check if user is admin
 * Must be used after protect middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== AUTH.ROLES.ADMIN) {
    return next(new AppError(AUTH.MESSAGES.ADMIN.ONLY_ADMINS_CAN_CREATE, 403));
  }

  next();
};

/**
 * Check if user is authenticated (already guaranteed by protect middleware)
 * Can use for additional logic if needed
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return next(new AppError(AUTH.MESSAGES.AUTH.UNAUTHORIZED, 401));
  }

  next();
};

module.exports = {
  requireAdmin,
  requireAuth,
};
