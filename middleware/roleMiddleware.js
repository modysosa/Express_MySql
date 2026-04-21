// Role-Based Authorization Middleware

const AppError = require("../utils/appError");
const AUTH = require("../constants/authConstants");

const isApiRequest = (req) =>
  req.originalUrl.startsWith("/api/") || req.baseUrl.startsWith("/api");

/**
 * Check if user is admin
 * Must be used after protect middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== AUTH.ROLES.ADMIN) {
    const error = new AppError(AUTH.MESSAGES.ADMIN.ONLY_ADMINS_CAN_CREATE, 403);

    // For API routes, pass to error handler. For view routes, redirect.
    if (isApiRequest(req)) {
      return next(error);
    }

    return res.status(403).send("Access denied");
  }

  next();
};

/**
 * Check if user is authenticated (already guaranteed by protect middleware)
 * Can use for additional logic if needed
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    const error = new AppError(AUTH.MESSAGES.AUTH.UNAUTHORIZED, 401);

    if (isApiRequest(req)) {
      return next(error);
    }

    return res.redirect("/login");
  }

  next();
};

module.exports = {
  requireAdmin,
  requireAuth,
};
