const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const upload = require("../middlewares/uploadMiddleware");
const {newStreetFood, editStreetFood} = require("../controllers/streetFood.controller");

const streetFoodRoute = express.Router();
streetFoodRoute.route("/")
    .post(validateToken,upload.single('image'),checkForMissingFields(["name","price","vote_power"]),newStreetFood);

streetFoodRoute.route("/:streetFoodId")
    .put(validateToken,upload.single('image'),editStreetFood)
    .delete()
    .get()
module.exports = streetFoodRoute;