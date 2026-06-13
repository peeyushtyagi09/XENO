/**
 * Async route handlers ko wrap karta hai
 * Promise reject hone par error next() se errorHandler tak jata hai
 * Har controller me try-catch likhne ki zaroorat nahi padti
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
