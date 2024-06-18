const Contestant = require("../models/contestant.model");
const Season = require("../models/season.model");
const asyncHandler = require("express-async-handler");
const path = require("path");
require("dotenv").config();

const contestantRegister = asyncHandler(async(req,res)=>{
    const {name,phone: phoneNumber,instagram,tiktok,email,performance_type: performanceType} = req.body;
    const currentSeason = await Season.find({current:true}).sort({_id: -1});
    if(!currentSeason[0] || currentSeason[0].acceptance !== true || new Date() < new Date(currentSeason[0].applicationDeadline)){
        res.status(400);
        throw new Error("Application can not be accepted at the moment");
    }
    const imageUrl = path.join(process.env.APP_URL,"uploads/images",req.file.filename);
    const instagramUrl = `https://www.instagram.com/${instagram}`;
    const tiktokUrl = `https://www.tiktok.com/${tiktok}`;
    const socials = {
        tiktok: tiktokUrl,
        instagram: instagramUrl
    }
    const contestant = await Contestant.create({
        name,
        phoneNumber,
        socials,
        email,
        performanceType,
        imageUrl,
        season: currentSeason[0]._id
    });
    
    if(!contestant){
        res.status(400);
        throw new Error("Error registering contestant")
    };
    const currentContestants = await Contestant.find({season:currentSeason[0]._id})
    if(currentContestants.length > currentSeason[0].limit - 1){
        currentSeason[0].acceptance = false;
        currentSeason[0].save();
    }
    return res.status(200).json({
        success: true,
        message: "Contestant details submitted you will receive a mail shortly",
        contestant
    })
});

module.exports = {
    contestantRegister
}