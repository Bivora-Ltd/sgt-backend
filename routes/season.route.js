const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const { newSeason, currentSeason, seasonContestants, advanceSeason } = require("../controllers/season.controller");

const seasonRoute = express.Router();

seasonRoute.post("/add",validateToken,checkForMissingFields(["title","limit","application_deadline"]),newSeason);

seasonRoute.get("/current",currentSeason);

seasonRoute.get("/:seasonTitle/contestants",seasonContestants);

seasonRoute.post("/advance",validateToken,advanceSeason)

module.exports = seasonRoute;