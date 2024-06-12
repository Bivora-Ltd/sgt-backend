const Mongoose = require("mongoose");

const paymentSchema = Mongoose.Schema(
    {
        method:{
            type: String
        },
        payment_for:{
            type: String
        },
        ref:{
            type: String,
            unique: true
        },
        amount:{
            type: Number
        }
    },
    {
        timestamps: true
    }
);

module.exports = Mongoose.model("Payment",paymentSchema);