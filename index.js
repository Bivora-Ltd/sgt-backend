const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const Router = require("./routes");
const _db = require("./config/dbConnection");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load('./utils/swagger.yaml');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('./uploads'));
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