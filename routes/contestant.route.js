const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const { contestantRegister, searchContestants, seasonContestants, contactUs, getContestant, voteContestant } = require("../controllers/contestant.controller");
const upload = require("../middlewares/uploadMiddleware");

const contestantRoute = express.Router();

contestantRoute.route("/register")
    .post(upload.single("profile"),checkForMissingFields(["name","phone","instagram","tiktok","email","performance_type"]),contestantRegister)

contestantRoute.get("/search/:season_title",searchContestants);

contestantRoute.get("/:season_title",seasonContestants);

contestantRoute.post("/contact",checkForMissingFields(["name","email","message","subject"]),contactUs);

contestantRoute.route("/:season_title/:contestant_id")
    .get(getContestant)

contestantRoute.post("/vote",checkForMissingFields(["contestant","streetfood"]),voteContestant)

module.exports = contestantRoute;