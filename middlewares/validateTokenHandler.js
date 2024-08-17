const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const validateToken = asyncHandler(
    async(req,res,next) =>{
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if(!authHeader){
            return res.status(401).json({
                message: "No token provided"
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded) => {
            if(err){
                res.status(401);
                throw new Error("Invalid token");
            };
            return decoded;
        });
        const admin =  await Admin.findById(decoded.admin.id);
        if (!admin) {
            res.status(401);
            throw new Error("Admin not found Please try log in");
        }
        req.admin = admin;
        next();
    }
)

module.exports = validateToken;