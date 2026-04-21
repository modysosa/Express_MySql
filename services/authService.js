// Authentication Service
// Handles JWT token generation, verification, and password operations

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authConfig = require("../config/authConfig");
const AppError = require("../utils/appError");

class AuthService {
  /**
   * Generate JWT token with minimal payload
   * @param {Object} user - User object
   * @returns {Object} { token, expiresIn }
   */
  generateToken(user) {
    const jwtConfig = authConfig.getJWTConfig();
    const payload = authConfig.getJWTPayload(user);

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm,
    });

    return {
      token,
      expiresIn: jwtConfig.expiresIn,
    };
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {AppError} If token is invalid or expired
   */
  verifyToken(token) {
    const jwtConfig = authConfig.getJWTConfig();

    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token has expired", 401);
      } else if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid token", 401);
      }
      throw new AppError("Token verification failed", 401);
    }
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {string} Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password to compare against
   * @returns {boolean} True if password matches
   */
  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Get cookie configuration
   * @returns {Object} { name, options }
   */
  getCookieConfig() {
    return authConfig.getCookieConfig();
  }

  /**
   * Get safe user response (filtered data)
   * @param {Object} user - User object
   * @returns {Object} Safe user response
   */
  getSafeUserResponse(user) {
    return authConfig.getSafeUserResponse(user);
  }
}

module.exports = new AuthService();
