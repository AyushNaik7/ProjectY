const express = require("express");
const instagramRoutes = require("./routes/instagramRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

// Basic CORS support for API consumers.
app.use((req, res, next) => {
  const allowedOrigin = process.env.API_ALLOWED_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Instagram insights backend is healthy",
  });
});

app.use("/api/instagram", instagramRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;