const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const Router = require("./routes");
const _db = require("./config/dbConnection");
// require("dotenv").config();
require("./cronjob");
const cors = require("cors");
const morgan = require("morgan");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load('./utils/swagger.yaml');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan((tokens, req, res) => {
  return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      content_length: tokens.res(req, res, 'content-length'),
      response_time: `${tokens['response-time'](req, res)} ms`,
      remote_addr: tokens['remote-addr'](req, res),
      user_agent: tokens['user-agent'](req, res),
      timestamp: new Date().toISOString()
  });
}));
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/images', express.static('./uploads/images'));
app.use("/api/v1", Router);
app.use(errorHandler);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDocs));

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

_db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});