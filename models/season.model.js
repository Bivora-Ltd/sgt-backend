const Mongoose = require("mongoose");

const seasonSchema = Mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        current:{
            type: Boolean,
            required: true,
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
        stages:[
            {
                stageId:{
                    type: Mongoose.Schema.Types.ObjectId,
                    ref: "Stage"
                }
            }
        ],
        contestants:[
            {
                contestantId:{
                    type: Mongoose.Schema.Types.ObjectId,
                    ref: "Contestant"
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = Mongoose.model("Season",seasonSchema);