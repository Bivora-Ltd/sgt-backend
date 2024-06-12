const express = require("express");
const { generatePaymentLink, paymentCallback } = require("../controllers/payment.controller");
const checkForMissingFields = require("../middlewares/checkMissingFields");

const paymentRoute = express.Router();

paymentRoute.route("/generate_link")
    .post(checkForMissingFields(["redirect_url","amount","email","name"]),generatePaymentLink)

paymentRoute.get("/callback", paymentCallback)

module.exports = paymentRoute;