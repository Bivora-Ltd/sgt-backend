const express = require("express");
const Router = express.Router();

Router.use("/a",(req,res)=>{
    return res.status(200).json({
        message: "Hello"
    })
})

module.exports = Router;