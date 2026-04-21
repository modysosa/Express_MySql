// Async Error Handler Wrapper
// Eliminates the need for try-catch blocks in async controllers

/**
 * Wrap async controller functions to catch errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
