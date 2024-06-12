const Mongoose = require("mongoose");

const adminSchema = Mongoose.Schema(
    {
        adminName:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = Mongoose.model("Admin",adminSchema);