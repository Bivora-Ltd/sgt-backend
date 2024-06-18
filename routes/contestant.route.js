const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const { contestantRegister } = require("../controllers/contestant.controller");
const upload = require("../middlewares/uploadMiddleware");

const contestantRoute = express.Router();

contestantRoute.route("/register")
    .post(upload.single("profile"),checkForMissingFields(["name","phone","instagram","tiktok","email","performance_type"]),contestantRegister)

module.exports = contestantRoute;