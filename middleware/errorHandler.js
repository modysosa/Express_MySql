// Centralized Error Handler Middleware
// Must be the last middleware in app.js

const AUTH = require("../constants/authConstants");

const errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.message = err.message || AUTH.MESSAGES.SERVER.ERROR;

  // Handle specific error types
  // (Add more as needed for your use case)

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.message = AUTH.MESSAGES.AUTH.TOKEN_INVALID;
  }

  // Token expired error
  if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.message = AUTH.MESSAGES.AUTH.TOKEN_INVALID;
  }

  // Duplicate email error (MySQL)
  if (err.code === "ER_DUP_ENTRY") {
    err.statusCode = 400;
    err.message = AUTH.MESSAGES.VALIDATION.USER_EXISTS;
  }

  // Log error in development
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Error:", {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  }

  const exposeStack =
    process.env.NODE_ENV !== "production" &&
    process.env.EXPOSE_ERROR_STACK === "true";

  // Send error response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(exposeStack && { error: err.stack }),
  });
};

module.exports = errorHandler;
