const Season = require("../models/season.model");
const Contestant = require("../models/contestant.model");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../utils/mail");

const newSeason = asyncHandler(async (req, res) => {
  const {
    title,
    limit,
    application_deadline,
    reg_fee: registrationFee,
  } = req.body;
  const today = new Date();
  if (new Date(application_deadline) <= today) {
    res.status(400);
    throw new Error("Application deadline must be in the future");
  }
  const lastSeason = await Season.find().sort({ _id: -1 });
  const newSeason = await Season.create({
    title,
    limit: parseInt(limit) || null,
    applicationDeadLine: new Date(application_deadline),
    registrationFee,
  });

  if (!newSeason) {
    res.status(400);
    throw new Error("Could not create season");
  }
  if (lastSeason[0]) {
    lastSeason[0].current = false;
    lastSeason[0].status = "completed";
    await lastSeason[0].save();
  }

  return res.status(200).json({
    success: true,
    message: "New season created",
  });
});

const currentSeason = asyncHandler(async (req, res) => {
  let currentSeason = await Season.find({ current: true }).sort({ _id: -1 });
  currentSeason = currentSeason[0];
  return res.status(200).json({
    success: true,
    currentSeason,
  });
});

const getSeason = asyncHandler(async (req, res) => {
  const { season_id: seasonId } = req.params;
  const season = await Season.findById(seasonId);
  return res.status(200).json({
    success: true,
    season,
  });
});

const getSeasonWinners = asyncHandler(async (req, res) => {
  const { season_id: seasonId } = req.params;
  const season = await Season.findById(seasonId);
  if (!season) {
    res.status(404);
    throw new Error("Season not found");
  }
  if (season.status !== "completed") {
    res.status(400);
    throw new Error("Season is still ongoing");
  }
  // winners includes every contestant not evicted or eliminated
  const winners = [];
  const contestants = await Contestant.find({
    season: season._id,
    status: { $in: ["winner", "second", "third", "fourth"] },
  });
  contestants.forEach((contestant) => {
    winners.push(contestant);
  });
  return res.status(200).json({
    success: true,
    data: {
      winners,
      season,
    },
  });
});

const advanceSeason = asyncHandler(async (req, res) => {
  let currentSeason = await Season.find({ current: true }).sort({ _id: -1 });
  currentSeason = currentSeason[0];
  if (!currentSeason) {
    return res.status(400).json({ message: "No running season found" });
  }

  const groups = ["Group A", "Group B", "Group C", "Group D"];
  const currentStage = currentSeason.status;

  switch (currentStage) {
    case "audition":
      const contestants = await Contestant.find({
        season: currentSeason._id,
      }).sort({ votes: -1 });
      let count = 1;
      for (let i = 0; i < contestants.length; i++) {
        const contestant = contestants[i];
        if (count <= 20) {
          let group = groups[(count - 1) % 4]; // Fixed group assignment
          contestant.group = group;
          contestant.status = "group";
          const message = `
                        Congratulations ${contestant.name},\n 
                        You are part of the top 20 to advance to the group stage.\n
                        See you at the next stage, where you'll battle it out in <strong>${group}</strong>.\n
                        Date and time will be announced on our official channels.`;

          try {
            await sendEmail(
              contestant.email,
              "Congratulations, you've advanced!",
              message
            );
          } catch (error) {
            console.error(
              `Error sending email to ${contestant.email}: ${error.message}`
            );
          }
        } else {
          contestant.status = "evicted";
        }
        contestant.votes = 0;
        await contestant.save();
        count++;
      }
      currentSeason.status = "group";
      currentSeason.acceptance = false;
      await currentSeason.save();
      return res.status(200).json({
        success: true,
        message: "Season advanced to group stage",
      });

    case "group":
      for (let group of groups) {
        const groupContestants = await Contestant.find({
          season: currentSeason._id,
          group,
          status: "group",
        }).sort({ votes: -1 });
        for (let j = 0; j < groupContestants.length; j++) {
          const contestant = groupContestants[j];
          if (j < 3) {
            // Top 3 advance
            contestant.status = "semi";
            contestant.votes = 0;
            const message = `
                            Congratulations ${contestant.name},\n 
                            You've made it to the top 3 in <strong>${group}</strong> and are advancing to the semi-finals.\n
                            Stay tuned for the next stage.`;
            try {
              await sendEmail(
                contestant.email,
                "Congratulations, you're advancing!",
                message
              );
            } catch (error) {
              console.error(
                `Error sending email to ${contestant.email}: ${error.message}`
              );
            }
          } else {
            contestant.status = "evicted";
          }
          await contestant.save();
        }
      }
      currentSeason.status = "semi";
      await currentSeason.save();
      return res.status(200).json({
        success: true,
        message: "Season advanced to semi-finals",
      });

    case "semi":
      for (let group of groups) {
        const groupContestants = await Contestant.find({
          season: currentSeason._id,
          group,
          status: "semi",
        }).sort({ votes: -1 });
        for (let j = 0; j < groupContestants.length; j++) {
          const contestant = groupContestants[j];
          if (j === 0) {
            // Only the top contestant from each group goes to the final
            contestant.status = "final";
            contestant.votes = 0;
            const message = `
                            Congratulations ${contestant.name},\n 
                            You've reached the finals as the top contestant from <strong>${group}</strong>.\n
                            Prepare for the final showdown.`;
            try {
              await sendEmail(
                contestant.email,
                "Congratulations, you're a finalist!",
                message
              );
            } catch (error) {
              console.error(
                `Error sending email to ${contestant.email}: ${error.message}`
              );
            }
          } else {
            contestant.status = "evicted";
          }
          // contestant.votes = 0;
          await contestant.save();
        }
      }
      currentSeason.status = "final";
      await currentSeason.save();
      return res.status(200).json({
        success: true,
        message: "Season advanced to finals",
      });

    case "final":
      const finalists = await Contestant.find({
        season: currentSeason._id,
        status: "final",
      }).sort({ votes: -1 });
      for (let i = 0; i < finalists.length; i++) {
        const contestant = finalists[i];
        switch (i) {
          case 0:
            contestant.status = "winner";
            const winnerMessage = `
                            Congratulations ${contestant.name},\n 
                            You are the winner of Street Got Talent ${currentSeason.title}.\n
                            Further steps will be communicated via our official channels.`;
            try {
              await sendEmail(
                contestant.email,
                "Congratulations, you are the winner!",
                winnerMessage
              );
            } catch (error) {
              console.error(
                `Error sending email to ${contestant.email}: ${error.message}`
              );
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
            contestant.status = "evicted";
            break;
        }
        await contestant.save();
      }
      currentSeason.status = "completed";
      currentSeason.current = false;
      await currentSeason.save();
      return res.status(200).json({
        success: true,
        message: `Season completed. Winner: ${finalists[0].name}`,
      });

    default:
      return res.status(400).json({
        message: "Invalid season status",
      });
  }
});

const allSeasons = asyncHandler(async (req, res) => {
  const seasons = await Season.find();
  return res.status(200).json({
    success: true,
    seasons,
  });
});

const updateSeason = asyncHandler(async (req, res) => {
  const { season_id } = req.params;
  const season = await Season.findById(season_id);
  if (!season) {
    res.status(404);
    throw new Error("Season not found");
  }
  const allowedFields = Object.keys(Season.schema.paths);

  const invalidFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    res.status(400);
    throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
  }

  Object.assign(season, req.body);
  await season.save();
  return res.status(200).json({
    success: true,
    season,
    message: "update sucessfull",
  });
});

module.exports = {
  newSeason,
  currentSeason,
  advanceSeason,
  allSeasons,
  getSeason,
  updateSeason,
  getSeasonWinners,
};
