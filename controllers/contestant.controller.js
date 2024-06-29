const Contestant = require("../models/contestant.model");
const Season = require("../models/season.model");
const asyncHandler = require("express-async-handler");
const path = require("path");
const sendEmail = require("../utils/mail");
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
    const tiktokUrl = `https://www.tiktok.com/@${tiktok}`;
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
    if(currentSeason[0].limit && currentContestants.length > currentSeason[0].limit - 1){
        currentSeason[0].acceptance = false;
        currentSeason[0].save();
    }
    const message = `
        Hello ${name} Your registration request for Street Got Talent 
        ${currentSeason[0].title} has been approved your registration Id 
        is <strong>${contestant._id}</strong>. </br> 
        See you at the Audition`;

    await sendEmail(email,"Registration Successful",message);
    return res.status(200).json({
        success: true,
        message: "Contestant details submitted you will receive a mail shortly",
        contestant
    })
});

const searchContestants = asyncHandler(async (req, res) => {
    const { season_title: seasonTitle } = req.params;
    const { limit = 10, page = 1, name, type } = req.query; // Query parameters for pagination and search criteria

    const limitValue = parseInt(limit);
    const pageValue = parseInt(page);

    let season;
    if (seasonTitle === "current") {
        season = await Season.find({ current: true }).sort({ _id: -1 }).limit(1);
        season = season[0];
    } else {
        season = await Season.findOne({ title: seasonTitle });
    }

    if (!season) {
        res.status(404);
        throw new Error("Season not found");
    }

    const seasonId = season._id;

    // Build the query object based on the search criteria
    const query = { season: seasonId };
    if (name) {
        query.name = { $regex: name, $options: 'i' }; // Case-insensitive search by name
    }
    if (type) {
        query.performanceType = { $regex: type, $options: 'i' }; // Case-insensitive search by performance type
    }

    const contestants = await Contestant.find(query)
        .skip((pageValue - 1) * limitValue)
        .limit(limitValue);

    const totalContestants = await Contestant.countDocuments(query);
    const totalPages = Math.ceil(totalContestants / limitValue);

    if (contestants.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No contestants found",
        });
    }

    return res.status(200).json({
        success: true,
        contestants,
        pagination: {
            totalContestants,
            totalPages,
            currentPage: pageValue,
            limit: limitValue
        }
    });
});

const seasonContestants = asyncHandler(async (req, res) => {
    const { season_title: seasonTitle } = req.params;
    const { limit = 10, page = 1 } = req.query; // Default values for limit and page

    const limitValue = parseInt(limit);
    const pageValue = parseInt(page);

    let season;
    if (seasonTitle === "current") {
        season = await Season.find({ current: true }).sort({ _id: -1 }).limit(1);
        season = season[0];
    } else {
        season = await Season.findOne({ title: seasonTitle });
    }

    if (!season) {
        res.status(404);
        throw new Error("Season not found");
    }

    const seasonId = season._id;

    const contestants = await Contestant.find({ season: seasonId })
        .skip((pageValue - 1) * limitValue)
        .limit(limitValue);

    const totalContestants = await Contestant.countDocuments({ season: seasonId });
    const totalPages = Math.ceil(totalContestants / limitValue);

    if (contestants.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No contestants found",
        });
    }

    return res.status(200).json({
        success: true,
        contestants,
        pagination: {
            totalContestants,
            totalPages,
            currentPage: pageValue,
            limit: limitValue
        }
    });
});

const contactUs = asyncHandler(async(req,res) => {
    const {name, email, message, subject} = req.body;
    const _message = `
        <h5>You have new enquiry</h5>
        <ul>
            <li>Name: ${name}</li>
            <li>Email: ${email}</li>
        </ul>
        message:
        <div>"${message}"</div>
    `;

    await sendEmail("xpat@streetgottalent.com",subject,_message);
    
    return res.status(200).json({
        success: true,
        message: "Your enquiry has been submitted \n expect a response from us soon"
    })
});

module.exports = {
    contestantRegister,
    searchContestants,
    seasonContestants,
    contactUs
}