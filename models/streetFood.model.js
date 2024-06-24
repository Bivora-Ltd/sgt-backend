const Mongoose = require("mongoose");

const streetFoodSchema = Mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

module.exports = Mongoose.model("StreetFood",streetFoodSchema);