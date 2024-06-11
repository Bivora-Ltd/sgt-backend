const asyncHandler = require("express-async-handler");
const Admin = require("../models/admin.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Method POST
// Endpoint {baseurl}/auth/register
// Desc Register and authenticate new admin

const registerAdmin = asyncHandler(
    async (req, res, next) => {
        const { adminName, email, password } = req.body;
        
        const containsSpaces = /\s/.test(adminName);
        if (containsSpaces) {
            res.status(400);
            throw new Error("adminname cannot contain spaces");
        }


        const adminAvailable = await Admin.findOne({ $or: [{ email: email }, { adminName: adminName }] });

        if (adminAvailable) {
            res.status(400);
            throw new Error("admin already registered");
        }
        const hashedPassword = crypto
            .createHash('sha256') 
            .update(password)
            .digest('hex');

        const admin = await admin.create({
            adminName,
            email,
            password: hashedPassword
        });

        if (admin) {
            return res.status(201)
                .json({
                    message: "Registration Successful",
                    success:true,
                    admin
                });
        } else {
            res.status(400);
            throw new Error("Registration Failed");
        }
    }
);

// Method POST
// Endpoint {baseurl}/auth/login
// desc login and authenticate admin

const loginAdmin = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body;

        const admin = await admin.findOne({ email });

        if (!admin) {
            res.status(401);
            throw new Error("Invalid email");
        }

        const hashedPassword = crypto
            .createHash('sha256')  
            .update(password)
            .digest('hex');

        if (hashedPassword === admin.password) {
            const accessToken = jwt.sign(
                {
                    admin:{
                        id:admin.id,
                        email:admin.email,
                        adminName: admin.adminName
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "30d"
                }
            )
            return res.status(200).json({
                title: "Login Successful",
                message: "admin loged in with success",
                devNote: "Store this token to access secured endpoints",
                accessToken
            });
        } else {
            // Passwords do not match, authentication failed
            res.status(401);
            throw new Error("Invalid password");
        }
    }
);

// Method POST
// Endpoint {baseurl}/auth/validate-token
// desc validate the access token and return the admin details

const currentAdmin = asyncHandler(
    async(req, res, next) => {
        const admin = req.admin;
        return res.status(200)
        .json({admin})
    }
)

module.exports = {
    registerAdmin,
    loginAdmin,
    currentAdmin
};
