// Centralized Error Handler Middleware
// Must be the last middleware in app.js

const AUTH = require("../constants/authConstants");

const errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.message = err.message || AUTH.MESSAGES.SERVER.ERROR;

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

  // Log errors in development.
  // Avoid stack spam for expected unauthenticated requests from frontend bootstrap.
  if (process.env.NODE_ENV !== "production") {
    const isExpectedUnauthorized =
      err.statusCode === 401 && err.message === "No token provided";

    if (isExpectedUnauthorized) {
      console.warn("[AUTH]", {
        message: err.message,
        statusCode: err.statusCode,
        method: req.method,
        path: req.originalUrl,
      });
    } else {
      console.error("[ERROR]", {
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack,
      });
    }
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
