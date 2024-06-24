const Season = require("../models/season.model");
const Contestant = require("../models/contestant.model");
const asyncHandler = require("express-async-handler");

const newSeason = asyncHandler(async(req,res)=>{
    const {title,limit,application_deadline,reg_fee:registrationFee} = req.body;
    const today = new Date();
    if(new Date(application_deadline) <= today){
        res.status(400);
        throw new Error("Application deadline must be in the future");
    }
    const lastSeason = await Season.find().sort({_id:-1});
    const newSeason = await Season.create({
        title,
        limit: parseInt(limit) || null,
        applicationDeadLine: new Date(application_deadline),
        registrationFee
    });

    if(!newSeason){
        res.status(400);
        throw new Error("Could not create season")
    }
    if(lastSeason[0]){
        lastSeason[0].current = false;
        await lastSeason[0].save();
    };

    return res.status(200).json({
        success: true,
        message: "New season created"
    })
});

const currentSeason = asyncHandler(async(req,res)=>{
    let currentSeason = await Season.find({current:true}).sort({_id:-1});
    currentSeason = currentSeason[0];
    return res.status(200).json({
        success: true,
        currentSeason
    });
});


const advanceSeason = asyncHandler(async(req,res)=>{
    let currentSeason = await Season.find({current:true}).sort({_id:-1});
    currentSeason = currentSeason[0];
    if(!currentSeason){
        res.status(400);
        throw new Error("you have no season running")
    };
    const groups = ["group_a","group_b","group_c","group_d"];
    const currentStage = currentSeason.status;
    switch (currentStage) {
        case "audition":
            const contestants = await Contestant.find({season: currentSeason._id}).sort({votes: -1});
            let count = 1;
            for (let i = 0; i < contestants.length; i++) {
                const contestant = contestants[i];
                if (count <= 20) {
                    let group = groups[count % 4];
                    contestant.group = group;
                    contestant.status = "group";
                } else {
                    contestant.status = "eliminated";
                }
                await contestant.save();
                count++;
            }
            currentSeason.status = "group";
            currentSeason.acceptance = false;
            await currentSeason.save();
            return res.status(200).json({
                success: true,
                message: "Season advanced to group stage"
            });
        case "group":
            for (let i = 0; i < groups.length; i++) {
                const contestants = await Contestant.find({season: currentSeason._id, group:groups[i]}).sort({votes: -1});
                for (let j = 0; j < contestants.length; j++) {
                    const contestant = contestants[j];
                    if (j <= 3) {
                        contestant.status = "semi";
                    } else {
                        contestant.status = "eliminated";
                    }
                    await contestant.save();
                }
            }
            currentSeason.status = "semi";
            await currentSeason.save();
            return res.status(200).json({
                success: true,
                message: "Season advanced to semi-finals"
            });
        case "semi":
            for (let i = 0; i < groups.length; i++) {
                const contestants = await Contestant.find({season: currentSeason._id, group: groups[i]}).sort({votes: -1});
                for (let j = 0; j < contestants.length; j++) {
                    const contestant = contestants[j];
                    if (j === 1) {
                        contestant.status = "final";
                    } else {
                        contestant.status = "eliminated";
                    }
                    await contestant.save();
                }
            }
            currentSeason.status = "final";
            await currentSeason.save();
            return res.status(200).json({
                success: true,
                message: "Season advanced to finals"
            });
        case "final":
            const finalists = await Contestant.find({season: currentSeason._id, status: "final"}).sort({votes: -1});
            for (let i = 0; i < finalists.length; i++) {
                const contestant = finalists[i];
                switch(i){
                    case 0:
                        contestant.status = "winner";
                        break;
                    case 1:
                        contestant.status = "second";
                        break;
                    case 2:
                        contestant.status = "third";
                        break;
                    case 3:
                        contestant.status = "fourth";
                        break;
                    default:
                        contestant.status = "eliminated";
                        break;
                }
                await contestant.save();
            }
            currentSeason.status = "completed";
            currentSeason.current = false;
            await currentSeason.save();
            return res.status(200).json({
                success: true,
                message: "Season completed. Winner: " + finalists[0].name
            });
        default:
            res.status(400);
            throw new Error("Invalid season status");
    }
    
})

module.exports = {
    newSeason,
    currentSeason,
    advanceSeason
}