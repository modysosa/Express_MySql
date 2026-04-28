// User Controller
// User-specific operations (profile, dashboard, etc.)

const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const authService = require("../services/authService");
const userService = require("../services/userService");

/**
 * GET /api/users/profile
 * Get current user profile (API)
 */
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);

  return sendSuccess(res, 200, "Profile retrieved successfully", {
    user: authService.getSafeUserResponse(user),
  });
});

module.exports = {
  getProfile,
};
