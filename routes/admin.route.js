const express = require("express");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const { registerAdmin, loginAdmin } = require("../controllers/admin.controller");

const adminRoute = express.Router();

adminRoute.route("/register")
    .post(checkForMissingFields(["admin_name","email","password"]),registerAdmin);
adminRoute.route("/login")
    .post(checkForMissingFields(["email","password"]),loginAdmin);

module.exports = adminRoute;