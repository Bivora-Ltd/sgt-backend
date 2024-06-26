const express = require("express");
const { recordPayment, initializeTransaction } = require("../controllers/payment.controller");
const checkForMissingFields = require("../middlewares/checkMissingFields");

const paymentRoute = express.Router();

paymentRoute.route("/generate_link")
    .post(checkForMissingFields(["amount","email","callback_url","payment_for"]),initializeTransaction)

paymentRoute.post("/verify",checkForMissingFields(["reference"]),recordPayment)

module.exports = paymentRoute;