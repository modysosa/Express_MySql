// Authentication Validators

const AUTH = require("../constants/authConstants");
const AppError = require("../utils/appError");

class AuthValidator {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @throws {AppError} If password is invalid
   */
  validatePassword(password) {
    if (!password) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.EMAIL_PASSWORD_REQUIRED, 400);
    }

    if (password.length < AUTH.PASSWORD_MIN_LENGTH) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH, 400);
    }

    if (password.length > AUTH.PASSWORD_MAX_LENGTH) {
      throw new AppError("Password is too long", 400);
    }
  }

  /**
   * Validate login credentials
   * @param {string} email - Email to validate
   * @param {string} password - Password to validate
   * @throws {AppError} If validation fails
   */
  validateLogin(email, password) {
    if (!email || !password) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.EMAIL_PASSWORD_REQUIRED, 400);
    }

    if (!this.isValidEmail(email)) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.EMAIL_INVALID, 400);
    }

    this.validatePassword(password);
  }

  /**
   * Validate registration data
   * @param {string} name - Name to validate
   * @param {string} email - Email to validate
   * @param {string} password - Password to validate
   * @throws {AppError} If validation fails
   */
  validateRegistration(name, email, password) {
    if (!name || !email || !password) {
      throw new AppError(
        AUTH.MESSAGES.VALIDATION.NAME_EMAIL_PASSWORD_REQUIRED,
        400,
      );
    }

    if (name.length < AUTH.NAME_MIN_LENGTH) {
      throw new AppError("Name must be at least 2 characters", 400);
    }

    if (name.length > AUTH.NAME_MAX_LENGTH) {
      throw new AppError("Name is too long", 400);
    }

    if (!this.isValidEmail(email)) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.EMAIL_INVALID, 400);
    }

    this.validatePassword(password);
  }
}

module.exports = new AuthValidator();
