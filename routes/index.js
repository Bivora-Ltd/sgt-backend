const express = require("express");
const paymentRoute = require("./payment.route");
const contestantRoute = require("./contestant.route");
const seasonRoute = require("./season.route");
const adminRoute = require("./admin.route");
const streetFoodRoute = require("./streetFood.route");
const Router = express.Router();

Router.use("/payments",paymentRoute);
Router.use("/contestants",contestantRoute);
Router.use("/seasons",seasonRoute);
Router.use("/admins",adminRoute);
Router.use("/streetfoods",streetFoodRoute);

module.exports = Router;