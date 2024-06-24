const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const { newSeason, currentSeason, advanceSeason } = require("../controllers/season.controller");

const seasonRoute = express.Router();

seasonRoute.post("/new",validateToken,checkForMissingFields(["title","application_deadline","reg_fee"]),newSeason);

seasonRoute.get("/current",currentSeason);


seasonRoute.post("/advance",validateToken,advanceSeason)

module.exports = seasonRoute;