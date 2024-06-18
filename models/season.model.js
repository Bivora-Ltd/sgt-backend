const Mongoose = require("mongoose");

const seasonSchema = Mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
            unique: true
        },
        current:{
            type: Boolean,
            default: true
        },
        limit:{
            type: Number,
            required: true,
        },
        applicationDeadLine:{
            type: Date,
            required: false,
        },
        status:{
            type: String,
            default: "audition"
        },
        acceptance:{
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = Mongoose.model("Season",seasonSchema);