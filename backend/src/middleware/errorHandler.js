const AppError = require("../utils/AppError");

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, "NOT_FOUND"));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";

  const response = {
    success: false,
    error: {
      code,
      message: err.message || "Unexpected server error",
    },
  };

  if (process.env.NODE_ENV !== "production" && err.details) {
    response.error.details = err.details;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};