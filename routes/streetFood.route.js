const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");

const streetFoodRoute = express.Router();

module.exports = streetFoodRoute;