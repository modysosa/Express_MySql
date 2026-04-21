// User Validators

const AUTH = require("../constants/authConstants");
const AppError = require("../utils/appError");
const authValidator = require("./authValidator");

class UserValidator {
  /**
   * Validate user update data
   * @param {string} name - Name to validate
   * @param {string} email - Email to validate
   * @throws {AppError} If validation fails
   */
  validateUserUpdate(name, email) {
    if (!name || !email) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.NAME_EMAIL_REQUIRED, 400);
    }

    if (name.length < AUTH.NAME_MIN_LENGTH) {
      throw new AppError("Name must be at least 2 characters", 400);
    }

    if (!authValidator.isValidEmail(email)) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.EMAIL_INVALID, 400);
    }
  }

  /**
   * Validate user creation (admin only)
   * @param {string} name - Name to validate
   * @param {string} email - Email to validate
   * @param {string} password - Password to validate
   * @throws {AppError} If validation fails
   */
  validateUserCreation(name, email, password) {
    authValidator.validateRegistration(name, email, password);
  }
}

module.exports = new UserValidator();
