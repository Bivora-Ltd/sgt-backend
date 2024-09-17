const Season = require("../models/season.model");
const Contestant = require("../models/contestant.model");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/mail");

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

const getSeason = asyncHandler(async(req,res)=>{
    const {season_id: seasonId} = req.params;
    const season = await Season.findById(seasonId);
    return res.status(200).json({
        success: true,
        season
    })
})

const advanceSeason = asyncHandler(async(req,res)=>{
    let currentSeason = await Season.find({current:true}).sort({_id:-1});
    currentSeason = currentSeason[0];
    if(!currentSeason){
        res.status(400);
        throw new Error("you have no season running")
    };
    const groups = ["Group A","Group B","Group C","Group D"];
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
                    const message = `
                        Congratulations ${contestant.name} \n 
                        You are part of the <strong>top 20</strong> to advance to the group stage \n
                        See you at the next stage where you battle it out with others in <strong>${group}</strong>
                        Date and time will be announced on our official handles below`;

                    const mail = await sendEmail(contestant.email,"Congratulations you advanced",message);
                    if(!mail){
                        res.status(400);
                        throw new Error("Error sending email");
                    }
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
                        const message = `
                        Congratulations ${name} \n 
                        You made it to the <strong>top 3</strong> <strong>${groups[i]}</strong> to advance to the semi-finals \n
                        Date and time will be announced on our official handles below`;

                        const mail = await sendEmail(email,"Congratulations you advanced",message);
                        if(!mail){
                            res.status(400);
                            throw new Error("Error sending email");
                        }
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
                        const message = `
                        Congratulations ${name} \n 
                        You made it to the <strong>finals</strong> as the <strong>${groups[i]}</strong> Top Contestants \n
                        Can you battle it out with other finalists for the crown \n
                        Date and time will be announced on our official handles below`;

                        const mail = await sendEmail(email,"Congratulations you advanced",message);
                        if(!mail){
                            res.status(400);
                            throw new Error("Error sending email");
                        }
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
                        const message = `
                        Congratulations ${name} \n 
                        <strong> You are the winner of Streets Got Talent ${currentSeason.title}</strong> \n
                        Next steps will be communicated on our official handle`;

                        const mail = await sendEmail(email,"Congratulations you are the winner",message);
                        if(!mail){
                            res.status(400);
                            throw new Error("Error sending email");
                        }
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
    
});

const allSeasons = asyncHandler(async(req,res)=>{
    const seasons = await Season.find();
    return res.status(200).json({
        success: true,
        seasons
    })
});

const updateSeason = asyncHandler(async(req,res) =>{
    const {season_id} = req.params;
    const season = await Season.findById(season_id);
    if(!season){
        res.status(404);
        throw new Error("Season not found");
    }
    const allowedFields = Object.keys(Season.schema.paths);

    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        res.status(400);
        throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
    }

    Object.assign(season,req.body);
    await season.save();
    return res.status(200).json({
        success: true,
        season
    })
});

module.exports = {
    newSeason,
    currentSeason,
    advanceSeason,
    allSeasons,
    getSeason,
    updateSeason
}