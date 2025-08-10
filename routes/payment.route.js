const express = require("express");
const { recordPayment, history } = require("../controllers/payment.controller");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");

const paymentRoute = express.Router();

paymentRoute.post(
  "/verify",
  checkForMissingFields(["reference", "metadata"]),
  recordPayment
);

paymentRoute.get("/history", validateToken, history);

module.exports = paymentRoute;
