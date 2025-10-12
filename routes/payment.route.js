const express = require("express");
const crypto = require("crypto");
const expressAsyncHandler = require("express-async-handler");
const paymentModel = require("../models/payment.model");
const seasonModel = require("../models/season.model");
const { default: fetch } = require("node-fetch");
const axios = require("axios");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const { recordPayment, history } = require("../controllers/payment.controller");

const paymentRoute = express.Router();

// ✅ Use raw body only for webhook route
paymentRoute.post(
  "/webhook",
  express.raw({ type: "*/*" }),
  expressAsyncHandler(async (req, res) => {
    res.sendStatus(200);

    try {
      const signature = req.headers["x-paystack-signature"];
      const computedSig = crypto
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
        .update(req.body) // raw Buffer
        .digest("hex");

      if (signature !== computedSig) {
        console.warn("⚠️ Invalid Paystack webhook signature");
        return;
      }

      const { event, data } = JSON.parse(req.body.toString());
      if (event !== "charge.success") return;

      const reference = data.reference;

      // ✅ Double verify with Paystack
      const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      });
      const result = await verify.json();

      if (!result.status || result.data.status !== "success") return;

      const { amount, customer, metadata } = result.data;
      const email = customer?.email || "unknown@user.com";

      // Prevent duplicates
      const existing = await paymentModel.findOne({ reference });
      if (existing) return;

      // Find active season
      const season = await seasonModel.findOne({ current: true }).sort({ _id: -1 });
      const seasonId = season?._id || null;

      // Save payment
      await paymentModel.create({
        email,
        amount: amount / 100,
        season: seasonId,
        reference,
        metaData: metadata,
        status: "success",
        verifiedAt: new Date(),
      });

      // Trigger next action
      switch (metadata?.paymentFor) {
        case "voting":
          await axios.post(`${process.env.BASE_URL}/api/v1/vote`, {
            contestant: metadata.contestantId,
            streetfood: metadata.foodId,
            qty: metadata.qty,
          });
          break;

        case "registration":
          await axios.post(`${process.env.BASE_URL}/api/v1/contestant/register`, metadata.formData);
          break;

        default:
          console.warn("⚠️ Unknown payment type:", metadata?.paymentFor);
      }

      console.log(`✅ Webhook processed successfully for ${metadata?.paymentFor}`);
    } catch (err) {
      console.error("🚨 Webhook processing error:", err);
    }
  })
);

paymentRoute.post(
  "/verify",
  checkForMissingFields(["reference", "metadata"]),
  recordPayment
);

paymentRoute.get("/history", validateToken, history);

module.exports = paymentRoute;
