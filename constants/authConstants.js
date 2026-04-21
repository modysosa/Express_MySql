// Authentication Constants

const AUTH = {
  // JWT
  JWT_ALGORITHM: "HS256",
  JWT_EXPIRY_SHORT: "1h", // For access tokens in production
  JWT_EXPIRY_LONG: "7d", // For refresh tokens

  // Cookies
  COOKIE_NAME: "authToken",
  COOKIE_OPTIONS_DEV: {
    httpOnly: true, // Secure: XSS protection (can't be accessed via JavaScript)
    secure: false, // Development: allow HTTP
    sameSite: "lax", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
  COOKIE_OPTIONS_PROD: {
    httpOnly: true, // Secure: XSS protection
    secure: true, // Production: require HTTPS
    sameSite: "strict", // CSRF protection (strict in production)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Validation
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,

  // Roles
  ROLES: {
    ADMIN: "admin",
    USER: "user",
  },

  // Messages
  MESSAGES: {
    AUTH: {
      INVALID_CREDENTIALS: "Invalid email or password",
      REGISTRATION_SUCCESS: "User registered successfully",
      LOGIN_SUCCESS: "Login successful",
      LOGOUT_SUCCESS: "Logged out successfully",
      TOKEN_REQUIRED: "No token provided",
      TOKEN_INVALID: "Invalid or expired token",
      UNAUTHORIZED: "Unauthorized access",
    },
    VALIDATION: {
      EMAIL_PASSWORD_REQUIRED: "Email and password are required",
      NAME_EMAIL_PASSWORD_REQUIRED: "Name, email, and password are required",
      NAME_EMAIL_REQUIRED: "Name and email are required",
      PASSWORD_MIN_LENGTH: `Password must be at least ${6} characters`,
      EMAIL_INVALID: "Invalid email format",
      USER_EXISTS: "User already exists with this email",
    },
    USER: {
      NOT_FOUND: "User not found",
      PROFILE_UPDATED: "Profile updated successfully",
    },
    ADMIN: {
      CANNOT_DELETE_SELF: "Cannot delete yourself",
      USER_PROMOTED: "User promoted to admin successfully",
      ONLY_ADMINS_CAN_CREATE: "Only admins can create users",
      ONLY_ADMINS_CAN_UPDATE: "Only admins can update users",
      ONLY_ADMINS_CAN_DELETE: "Only admins can delete users",
      ONLY_ADMINS_CAN_MANAGE_ROLES: "Only admins can manage user roles",
    },
    SERVER: {
      ERROR: "Server error",
      DATABASE_ERROR: "Database error",
    },
  },
};

module.exports = AUTH;
