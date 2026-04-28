// Updated Authentication Middleware
// Improved security and better error handling

const authService = require("../services/authService");
const AppError = require("../utils/appError");

/**
 * Protect route - verify JWT token
 * Works with both Bearer tokens and cookies
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
      return next(new AppError("No token provided", 401));
    }

    // Verify token using service
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = protect;
