const express = require("express");
const { recordPayment, initializeTransaction, history } = require("../controllers/payment.controller");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");

const paymentRoute = express.Router();

paymentRoute.route("/generate_link")
    .post(checkForMissingFields(["amount","email","callback_url","payment_for"]),initializeTransaction)

paymentRoute.post("/verify",checkForMissingFields(["reference"]),recordPayment);

paymentRoute.get("/history",validateToken,history);

module.exports = paymentRoute;