/**
 * Wraps an async controller/service call so rejected promises are
 * forwarded to Express's centralized error handler instead of requiring
 * a try/catch block in every single controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
