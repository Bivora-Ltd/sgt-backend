const asyncHandler = require("express-async-handler");
const Payment = require("../models/payment.model");
const Season = require("../models/season.model");
require("dotenv").config();

const recordPayment = asyncHandler(async (req, res) => {
  const { reference, metadata } = req.body;

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

    const { amount, customer } = verificationData.data;

    if (!customer || !metadata) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment data from Paystack",
      });
    }

    // check missing metadata fields and return missing fields
    const requiredFields = ["name", "paymentFor", "channel", "currency"];
    const missingFields = requiredFields.filter(
      (field) => !metadata[field] || metadata[field].trim() === ""
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing metadata fields: ${missingFields.join(", ")}`,
      });
    }

    const email = customer.email;
    const name = metadata.name;
    const paymentFor = metadata.paymentFor;
    const channel = metadata.channel;
    const currency = metadata.currency;

    let currentSeason = await Season.find({ current: true }).sort({ _id: -1 });
    currentSeason = currentSeason[0];
    if (!currentSeason && metadata.paymentFor !== "donation") {
      return res.status(400).json({
        success: false,
        message: "No season is in progress",
      });
    }

    const season = currentSeason._id || null;

    const newPayment = await Payment.create({
      email,
      amount: amount / 100, // Paystack amount is in kobo
      season,
      reference,
      metaData: {
        paymentFor,
        name,
        contestantId: metadata.contestantId || null,
        channel,
        currency: currency || "NGN",
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
    } else {
      let currentSeason = await Season.find({ current: true }).sort({
        _id: -1,
      });
      currentSeason = currentSeason[0];
      if (!currentSeason) {
        return res.status(400).json({
          success: false,
          message: "No season is in progress",
        });
      }

      filter.season = currentSeason._id;
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
      return res.status(200).json({
        success: false,
        message: "No payment history found",
        payments: [],
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
