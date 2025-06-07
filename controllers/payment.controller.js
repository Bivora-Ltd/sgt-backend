const asyncHandler = require("express-async-handler");
const Payment = require("../models/payment.model");
const Contestant = require("../models/contestant.model");
const Season = require("../models/season.model");
require("dotenv").config();

const recordPayment = asyncHandler(async (req, res) => {
  const { reference } = req.body;

  try {
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verificationData = await verificationResponse.json();

    if (verificationData.status !== true) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        error: verificationData.message,
      });
    }

    const { amount, customer, metadata } = verificationData.data;

    if (!customer || !metadata) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment data from Paystack",
      });
    }

    const email = customer.email;
    const name = metadata.name;
    const paymentFor = metadata.paymentFor;

    let currentSeason = await Season.find({ current: true }).sort({ _id: -1 });
    currentSeason = currentSeason[0];
    if (!currentSeason) {
      return res.status(400).json({
        success: false,
        message: "No season is in progress",
      });
    }

    const season = currentSeason._id;

    const newPayment = await Payment.create({
      email,
      amount: amount / 100, // Paystack amount is in kobo
      season,
      reference,
      metaData: {
        paymentFor,
        name,
        contestantId: metadata.contestantId || null, // Optional contestant ID
      },
    });

    if (!newPayment) {
      return res.status(400).json({
        success: false,
        message: "Error saving payment details",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      payment: newPayment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const history = asyncHandler(async (req, res) => {
  try {
    // check for filter query parameters eg ?season=12345&contestant=67890&paymentFor=registration
    const { season, contestant, paymentFor } = req.query;
    const filter = {};
    if (season) {
      filter.season = season;
    }
    if (contestant) {
      filter["metaData.contestantId"] = contestant;
    }
    if (paymentFor) {
      filter["metaData.paymentFor"] = paymentFor;
    }
    const payments = await Payment.find(filter)
      .populate("season", "name current")
      .populate("metaData.contestantId", "name");
    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payment history found",
      });
    }
    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  recordPayment,
  history,
};
