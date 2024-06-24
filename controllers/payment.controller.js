const {v4: uuidv4} = require("uuid");
const asyncHandler = require("express-async-handler");
const Payment = require("../models/payment.model");
const Season = require("../models/season.model");
require("dotenv").config();
const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);


const recordPayment = asyncHandler(async (req, res)=>{
    const {amount, payment_for:paymentFor, email, name} = req.body;
    let currentSeason = await Season.find({current:true}).sort({_id:-1});
    currentSeason = currentSeason[0];
    if(!currentSeason){
        res.status(400);
        throw new Error("No season is in progress")
    }
    const season = currentSeason._id;
    const newPayment = await Payment.create({
        name,email,amount,season,paymentFor
    });

    if(! newPayment){
        res.status(400);
        throw new Error("Error saving payment details");
    }
    return res.status(200).json({
        success: true,
        message: "New payment recorded",
        payment: newPayment
    });
});

const initializeTransaction = async (req, res) => {
    const { email, amount, callback_url } = req.body;

    try {
        const response = await paystack.transaction.initialize({
            email,
            amount: amount * 100, // Paystack expects the amount in kobo
            callback_url
        });

        res.status(200).json({
            status: 'success',
            authorization_url: response.data.authorization_url,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};


module.exports = {
    initializeTransaction,
    recordPayment,
};
