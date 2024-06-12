const Mongoose = require("mongoose");

const stageSchema = Mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        limit:{
            type: Number,
            required: true
        },
        contestants:[
            {
                id:{
                    type: Mongoose.Schema.Types.ObjectId,
                    ref: "Contestant"
                }
            }
        ],
        season:{
            type: Mongoose.Schema.Types.ObjectId,
            ref: "Season"
        }
    },
    {
        timestamps: true
    }
);

module.exports = Mongoose.model("Stage",stageSchema);