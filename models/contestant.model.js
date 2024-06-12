const Mongoose = require("mongoose");

const contestantSchema = Mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    performanceType:{
        type: String,
        required: true
    },
    socials:{
        tiktok:{
            type: String
        },
        instagram:{
            type: String
        }
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    votes:{
        type: Number,
        default: 0
    },
    season:{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Season"
    },
    lastStage:{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Stage"
    }
},
    {
        timestamps: true
    }
);

module.exports = Mongoose.model("Contestant", contestantSchema);