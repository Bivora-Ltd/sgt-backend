const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const Router = require("./routes");
const _db = require("./config/dbConnection");
require("dotenv").config();
require("./cronjob");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load("./utils/swagger.yaml");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS ---
app.use(cors({
  origin: "*", // restrict in production
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static files (uploads, etc.) ---
app.use("/uploads/images", express.static("./uploads/images"));

// --- API routes only ---
app.use(
  "/api",
  morgan((tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      content_length: tokens.res(req, res, "content-length"),
      response_time: `${tokens["response-time"](req, res)} ms`,
      remote_addr: tokens["remote-addr"](req, res),
      user_agent: tokens["user-agent"](req, res),
      timestamp: new Date().toISOString(),
    });
  })
);

app.use("/api/v1", Router);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDocs));

// --- API 404 handler ---
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found at all",
  });
});

// --- API error handler (only runs for API errors) ---
app.use("/api", errorHandler);

// --- Serve frontend build ---
app.use(express.static(path.join(__dirname, "client-build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client-build", "index.html"));
});

// --- Start DB + Server ---
_db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
