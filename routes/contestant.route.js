const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const { contestantRegister, searchContestants, seasonContestants, contactUs } = require("../controllers/contestant.controller");
const upload = require("../middlewares/uploadMiddleware");

const contestantRoute = express.Router();

contestantRoute.route("/register")
    .post(upload.single("profile"),checkForMissingFields(["name","phone","instagram","tiktok","email","performance_type"]),contestantRegister)

contestantRoute.get("/search/:season_title",searchContestants);

contestantRoute.get("/:season_title",seasonContestants);

contestantRoute.post("/contact",checkForMissingFields(["name","email","message","subject"]),contactUs);

module.exports = contestantRoute;