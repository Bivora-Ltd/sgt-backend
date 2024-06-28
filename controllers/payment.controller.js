const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Payment = require("../models/payment.model");
const Season = require("../models/season.model");
require("dotenv").config();

const FLW_BASE_URL = "https://api.flutterwave.com/v3";

const initializeTransaction = async (req, res) => {
    const { email, amount, callback_url, payment_for: paymentFor, name } = req.body;

    const payload = {
        tx_ref: uuidv4(),
        amount: amount,
        currency: 'NGN',
        redirect_url: callback_url,
        customer: {
            email,
            name
        },
        customizations: {
            title: 'Payment for Street Got Talent',
            description: paymentFor,
            logo: "https://sgt-six.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhero.9e061f3d.png&w=128&q=75" // Replace with your logo URL
        },
        meta: {
            name,
            paymentFor
        }
    };

    try {
        const response = await fetch(`${FLW_BASE_URL}/payments`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();

        if (responseData.status === "success") {
            res.status(200).json({
                status: 'success',
                authorization_url: responseData.data.link,
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: responseData.message,
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};

const recordPayment = asyncHandler(async (req, res) => {
    const { reference } = req.body;

    try {
        const verificationResponse = await fetch(`${FLW_BASE_URL}/transactions/${reference}/verify`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const verificationData = await verificationResponse.json();

        if (verificationData.status !== "success") {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                error: verificationData.message
            });
        }

        const { amount, customer, meta } = verificationData.data;

        if (!customer || !meta) {
            return res.status(400).json({
                success: false,
                message: 'Incomplete payment data from Flutterwave'
            });
        }

        const email = customer.email;
        const name = meta.name;
        const paymentFor = meta.paymentFor;

        let currentSeason = await Season.find({ current: true }).sort({ _id: -1 });
        currentSeason = currentSeason[0];
        if (!currentSeason) {
            return res.status(400).json({
                success: false,
                message: 'No season is in progress'
            });
        }

        const season = currentSeason._id;

        const newPayment = await Payment.create({
            name,
            email,
            amount: amount,
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
            message: 'Payment successful',
            payment: newPayment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const history = asyncHandler(async (req, res) => {
    try {
        const response = await fetch(`${FLW_BASE_URL}/transactions`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const responseData = await response.json();

        if (responseData.status !== "success") {
            return res.status(400).json({
                success: false,
                message: responseData.message
            });
        }

        res.status(200).json({
            success: true,
            transactions: responseData.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = {
    initializeTransaction,
    recordPayment,
    history
};
