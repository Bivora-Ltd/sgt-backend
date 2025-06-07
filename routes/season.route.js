const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const {
  newSeason,
  currentSeason,
  advanceSeason,
  allSeasons,
  getSeason,
  updateSeason,
  getSeasonWinners,
} = require("../controllers/season.controller");

const seasonRoute = express.Router();

seasonRoute
  .route("/")
  .post(
    validateToken,
    checkForMissingFields(["title", "application_deadline", "reg_fee"]),
    newSeason
  )
  .get(validateToken, allSeasons);

seasonRoute.get("/current", currentSeason);
seasonRoute.get("/:season_id/winner", validateToken, getSeasonWinners);
seasonRoute.get("/:season_id", getSeason);
seasonRoute.put("/:season_id", validateToken, updateSeason);

seasonRoute.post("/advance", validateToken, advanceSeason);

module.exports = seasonRoute;
