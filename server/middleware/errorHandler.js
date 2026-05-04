function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
