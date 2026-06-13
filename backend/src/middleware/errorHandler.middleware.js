const ApiError = require("../utils/ApiError");

/**
 * Central error handler — saari errors yahan handle hoti hain
 * Production me stack trace sirf development mode me bhejte hain
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Kuch galat ho gaya, please try again";
  let errors = err.errors || null;

  // Galat MongoDB ObjectId (jaise /customers/invalid-id)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Customer ID galat hai — valid 24-character ObjectId chahiye";
    errors = null;
  }

  // Mongoose schema validation fail
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation fail ho gayi";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Duplicate key — jaise same email dobara register
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Yeh ${field} pehle se exist karta hai`;
    errors = null;
  }

  // Joi ya ApiError — already sahi format me hai
  const response = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  // Development me debugging ke liye stack trace
  if (process.env.NODE_ENV === "development" && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
