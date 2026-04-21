// Updated Authentication Middleware
// Improved security and better error handling

const authService = require("../services/authService");
const AppError = require("../utils/appError");

const isApiRequest = (req) =>
  req.originalUrl.startsWith("/api/") || req.baseUrl.startsWith("/api");

/**
 * Protect route - verify JWT token
 * Works with both Bearer tokens (API) and cookies (browser)
 */
const protect = (req, res, next) => {
  try {
    let token;

    // Check Authorization header first (for API calls)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.authToken) {
      // Fall back to cookie (for browser requests)
      token = req.cookies.authToken;
    }

    if (!token) {
      // For API routes, return JSON. For view routes, redirect to login.
      if (isApiRequest(req)) {
        const error = new AppError("No token provided", 401);
        return next(error);
      }
      return res.redirect("/login");
    }

    // Verify token using service
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // For API routes, return error. For view routes, redirect to login.
    if (isApiRequest(req)) {
      return next(error);
    }
    res.redirect("/login");
  }
};

module.exports = protect;
