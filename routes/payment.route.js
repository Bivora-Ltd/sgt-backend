const express = require("express");
const { recordPayment, initializeTransaction } = require("../controllers/payment.controller");
const checkForMissingFields = require("../middlewares/checkMissingFields");

const paymentRoute = express.Router();

paymentRoute.route("/generate_link")
    .post(checkForMissingFields(["amount","email","callback_url"]),initializeTransaction)

paymentRoute.post("/save",checkForMissingFields(["reference","payment_for"]),recordPayment)

module.exports = paymentRoute;