// User Service
// Business logic for user operations

const userModel = require("../models/userModel");
const AppError = require("../utils/appError");
const AUTH = require("../constants/authConstants");

class UserService {
  /**
   * Normalize and validate user id values from route params/session.
   * @param {number|string} id - Raw user id value
   * @returns {number} Valid numeric user id
   * @throws {AppError} If id is invalid
   */
  normalizeUserId(id) {
    const parsedId = Number(id);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      throw new AppError("Invalid user id", 400);
    }

    return parsedId;
  }

  /**
   * Get all users for admin dashboard/API
   * @returns {Array} Array of users
   */
  async getAllUsers() {
    return userModel.getAllUsers();
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Object} User object
   * @throws {AppError} If user not found
   */
  async getUserById(id) {
    const safeId = this.normalizeUserId(id);
    const user = await userModel.findUserById(safeId);

    if (!user) {
      throw new AppError(AUTH.MESSAGES.USER.NOT_FOUND, 404);
    }

    return user;
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null if not found
   */
  async getUserByEmail(email) {
    return userModel.findUserByEmail(email);
  }

  /**
   * Create a new user
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} hashedPassword - Already hashed password
   * @param {boolean} isAdmin - Is admin flag
   * @returns {Object} Created user
   * @throws {AppError} If user already exists
   */
  async createUser(name, email, hashedPassword, isAdmin = false) {
    const existingUser = await this.getUserByEmail(email);

    if (existingUser) {
      throw new AppError(AUTH.MESSAGES.VALIDATION.USER_EXISTS, 400);
    }

    return userModel.createUser(name, email, hashedPassword, isAdmin);
  }

  /**
   * Update user basic info (name, email)
   * @param {number} id - User ID
   * @param {string} name - New name
   * @param {string} email - New email
   * @returns {Object} Updated user
   * @throws {AppError} If user not found or email already in use
   */
  async updateUser(id, name, email) {
    const safeId = this.normalizeUserId(id);
    const user = await this.getUserById(safeId);

    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new AppError("Email already in use", 400);
      }
    }

    const success = await userModel.updateUser(safeId, name, email);

    if (!success) {
      throw new AppError(AUTH.MESSAGES.SERVER.DATABASE_ERROR, 500);
    }

    return this.getUserById(safeId);
  }

  /**
   * Update user password
   * @param {number} id - User ID
   * @param {string} hashedPassword - Already hashed password
   * @returns {boolean} Success
   */
  async updateUserPassword(id, hashedPassword) {
    const safeId = this.normalizeUserId(id);
    await this.getUserById(safeId);

    const success = await userModel.updateUserPassword(safeId, hashedPassword);

    if (!success) {
      throw new AppError(AUTH.MESSAGES.SERVER.DATABASE_ERROR, 500);
    }

    return true;
  }

  /**
   * Update user admin status
   * @param {number} id - User ID
   * @param {boolean} isAdmin - Is admin flag
   * @returns {Object} Updated user
   * @throws {AppError} If user not found
   */
  async updateUserAdmin(id, isAdmin) {
    const safeId = this.normalizeUserId(id);
    await this.getUserById(safeId);

    const success = await userModel.updateUserAdmin(safeId, isAdmin);

    if (!success) {
      throw new AppError(AUTH.MESSAGES.SERVER.DATABASE_ERROR, 500);
    }

    return this.getUserById(safeId);
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @param {number} requestingUserId - ID of user making the request (prevent self-delete)
   * @returns {boolean} Success
   * @throws {AppError} If user not found or trying to delete self
   */
  async deleteUser(id, requestingUserId) {
    const safeId = this.normalizeUserId(id);
    const safeRequestingUserId = this.normalizeUserId(requestingUserId);

    if (safeId === safeRequestingUserId) {
      throw new AppError(AUTH.MESSAGES.ADMIN.CANNOT_DELETE_SELF, 400);
    }

    await this.getUserById(safeId);

    const success = await userModel.deleteUser(safeId);

    if (!success) {
      throw new AppError(AUTH.MESSAGES.SERVER.DATABASE_ERROR, 500);
    }

    return true;
  }
}

module.exports = new UserService();
