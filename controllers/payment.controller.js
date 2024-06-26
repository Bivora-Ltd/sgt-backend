const {v4: uuidv4} = require("uuid");
const asyncHandler = require("express-async-handler");
const Payment = require("../models/payment.model");
const Season = require("../models/season.model");
require("dotenv").config();
const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);


const recordPayment = asyncHandler(async (req, res) => {
    const { reference } = req.body;

    // Verify payment with Paystack
    const verificationResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    const verificationData = await verificationResponse.json();

    if (!verificationData.status) {
        return res.status(400).json({
            success: false,
            message: 'Payment verification failed',
            error: verificationData.message
        });
    }

    const { amount, customer, metadata } = verificationData.data;

    // Check if customer and metadata are available
    if (!customer || !metadata) {
        return res.status(400).json({
            success: false,
            message: 'Incomplete payment data from Paystack'
        });
    }

    const email = customer.email;
    const name = metadata.name;
    const paymentFor = metadata.paymentFor;

    // Find the current season
    let currentSeason = await Season.find({ current: true }).sort({ _id: -1 });
    currentSeason = currentSeason[0];
    if (!currentSeason) {
        return res.status(400).json({
            success: false,
            message: 'No season is in progress'
        });
    }

    const season = currentSeason._id;

    // Record the payment
    const newPayment = await Payment.create({
        name,
        email,
        amount: amount / 100,  // Paystack returns amount in kobo, convert to Naira
        season,
        paymentFor,
        reference
    });

    if (!newPayment) {
        return res.status(400).json({
            success: false,
            message: 'Error saving payment details'
        });
    }

    return res.status(200).json({
        success: true,
        message: 'payment sucessful',
        payment: newPayment
    });
});


const initializeTransaction = async (req, res) => {
    const { email, amount, callback_url, payment_for:paymentFor, name } = req.body;

    try {
        const response = await paystack.transaction.initialize({
            email,
            amount: amount * 100, // Paystack expects the amount in kobo
            callback_url,
            metadata:{
                name,
                paymentFor
            }
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
