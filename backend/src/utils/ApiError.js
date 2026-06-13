/**
 * Custom error class — operational errors ke liye
 * Controller se throw karo, errorHandler middleware pakad lega
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // validation errors array (optional)
    this.isOperational = true; // expected error hai, crash nahi
  }
}

module.exports = ApiError;
