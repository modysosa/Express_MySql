// Centralized Authentication Configuration

const AUTH = require("../constants/authConstants");

class AuthConfig {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
  }

  /**
   * Get JWT configuration
   */
  getJWTConfig() {
    return {
      secret: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
      expiresIn: process.env.JWT_EXPIRES_IN || AUTH.JWT_EXPIRY_LONG,
      algorithm: AUTH.JWT_ALGORITHM,
    };
  }

  /**
   * Get cookie configuration based on environment
   */
  getCookieConfig() {
    const baseConfig = this.isDevelopment
      ? AUTH.COOKIE_OPTIONS_DEV
      : AUTH.COOKIE_OPTIONS_PROD;

    return {
      name: AUTH.COOKIE_NAME,
      options: baseConfig,
    };
  }

  /**
   * Get JWT payload (minimal - only essential data)
   */
  getJWTPayload(user) {
    return {
      id: user.id,
      role: user.admin ? AUTH.ROLES.ADMIN : AUTH.ROLES.USER,
      // DO NOT include: name, email, password, timestamps, etc.
    };
  }

  /**
   * Get safe user response (exclude password and sensitive fields)
   */
  getSafeUserResponse(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.admin ? AUTH.ROLES.ADMIN : AUTH.ROLES.USER,
      createdAt: user.created_at,
    };
  }

  /**
   * Log configuration (for debugging in development)
   */
  logConfig() {
    if (this.isDevelopment) {
      console.log("📋 Auth Configuration:", {
        environment: process.env.NODE_ENV || "development",
        jwtExpiry: this.getJWTConfig().expiresIn,
        cookieSecure: this.getCookieConfig().options.secure,
        cookieHttpOnly: this.getCookieConfig().options.httpOnly,
      });
    }
  }
}

module.exports = new AuthConfig();
