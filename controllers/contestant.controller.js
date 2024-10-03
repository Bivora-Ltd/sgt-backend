const Contestant = require("../models/contestant.model");
const Season = require("../models/season.model");
const StreetFood = require("../models/streetFood.model");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/mail");
require("dotenv").config();

const contestantRegister = asyncHandler(async(req,res)=>{
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
    const {name,phone: phoneNumber,instagram,tiktok,email,performance_type: performanceType} = req.body;
    const currentSeason = await Season.find({current:true}).sort({_id: -1});
    if(!currentSeason[0] || currentSeason[0].acceptance !== true || new Date() < new Date(currentSeason[0].applicationDeadline)){
        res.status(400);
        throw new Error("Application can not be accepted at the moment");
    }
    const imageUrl = req.file.path;
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
        See you at the Audition </br>
        Further information will be communicated on our social media handles`;

    await sendEmail(email,"Registration Successful",message);
    return res.status(200).json({
        success: true,
        message: "Contestant details submitted you will receive a mail shortly",
        contestant
    })
});

const eliminateContestant = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const contestant = await Contestant.findById(id);
    if(! contestant){
        res.status(404)
        throw new Error("Contestant not found")
    }
    contestant.status = "evicted";
    await contestant.save();
    return res.status(200).json({
        status: true,
        message: "You evicted contestant "+ contestant.name
    });
})

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
        query.name = { $regex: name.trim(), $options: 'i' }; // Case-insensitive search by name
    }
    if (type) {
        query.performanceType = { $regex: type.trim(), $options: 'i' }; // Case-insensitive search by performance type
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
    const { limit = 8, page = 1 } = req.query; // Default values for limit and page

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
    const {leaderboard} = req.query;
    let contestants;
    if(leaderboard){
        contestants = await Contestant.find({ season: seasonId })
        .skip((pageValue - 1) * limitValue)
        .limit(limitValue)
        .sort({votes: -1})
    }else{
        contestants = await Contestant.find({ season: seasonId })
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue);
    }

    

    const totalContestants = await Contestant.countDocuments({ season: seasonId });
    const totalPages = Math.ceil(totalContestants / limitValue);

    if (contestants.length === 0 || !contestants) {
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

const getContestant = asyncHandler(async (req, res) => {
    const { season_title: seasonTitle, contestant_id: contestantId } = req.params;

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
    const contestant = await Contestant.findOne({$and:[{season: seasonId},{_id: contestantId}]});

    if (!contestant) {
        res.status(404);
        throw new Error("Contestant not found");
    }

    return res.status(200).json({
        success: true,
        contestant,
    });
});

const voteContestant = asyncHandler(async (req,res)=>{
    const {contestant,streetfood, qty} = req.body;
    const _contestant = await Contestant.findById(contestant);
    
    if(!_contestant){
        res.status(404);
        throw new Error("Contestant not found");
    }
    if(contestant.status == "evicted" || contestant.status == "eliminated"){
        res.status(400);
        throw new Error("You can not vote for an evicted contestant ");
    }
    const _streetFood = await StreetFood.findById(streetfood);
    
    if(!_streetFood){
        res.status(400);
        throw new Error("Street Food not found");
    }
    const votePower = parseInt(_streetFood.votePower) * qty;

    _contestant.votes += votePower;
    await _contestant.save();
    return res.status(200).json({
        success: true,
        message: "Vote submitted successfully",
        contestant: _contestant
    });
})

module.exports = {
    contestantRegister,
    searchContestants,
    seasonContestants,
    getContestant,
    contactUs,
    voteContestant,
    eliminateContestant
}