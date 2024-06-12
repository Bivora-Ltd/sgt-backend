const express = require("express");
const paymentRoute = require("./payment.route");
const Router = express.Router();

Router.use("/payments",paymentRoute);

module.exports = Router;