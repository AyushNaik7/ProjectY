const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const port = Number(process.env.PORT || 5000);

const server = app.listen(port, () => {
  console.log(`Instagram backend listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcefully shutting down after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));