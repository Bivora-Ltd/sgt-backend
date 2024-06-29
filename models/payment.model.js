const Mongoose = require("mongoose");

const paymentSchema = Mongoose.Schema({
    amount:{
        type: Number,
        required: true
    },
    paymentFor: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true
    },
    season: {
        type: Mongoose.Types.ObjectId,
        ref: "Season"
    },
    reference: {
        type: String,
        //unique: true,
        required: true
    }
});

module.exports = Mongoose.model("Payment",paymentSchema);
