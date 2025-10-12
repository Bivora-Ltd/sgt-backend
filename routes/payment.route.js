const express = require("express");
const crypto = require("crypto");
const expressAsyncHandler = require("express-async-handler");
const paymentModel = require("../models/payment.model");
const seasonModel = require("../models/season.model");
const { default: fetch } = require("node-fetch");
const checkForMissingFields = require("../middlewares/checkMissingFields");
const validateToken = require("../middlewares/validateTokenHandler");
const { recordPayment } = require("../controllers/payment.controller");

const paymentRoute = express.Router();

paymentRoute.post(
  "/webhook",
  expressAsyncHandler(async (req, res) => {
    res.status(200).send("Webhook received");

    const signature = req.headers["x-paystack-signature"];
    const computedSig = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (signature !== computedSig) {
      console.warn("⚠️ Invalid Paystack webhook signature");
      return;
    }

    const { event, data } = JSON.parse(req.body.toString());

    if (event !== "charge.success") return;

    const reference = data.reference;

    try {
      const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      });
      const result = await verify.json();

      if (!result.status || result.data.status !== "success") return;

      const { amount, customer, metadata } = result.data;
      const email = customer?.email || "unknown@user.com";

      const existing = await paymentModel.findOne({ reference });
      if (existing) return;

      const season = await seasonModel.findOne({ current: true }).sort({ _id: -1 });
      const seasonId = season?._id || null;

      await paymentModel.create({
        email,
        amount: amount / 100,
        season: seasonId,
        reference,
        metaData: metadata,
        status: "success",
        verifiedAt: new Date(),
      });

      switch (metadata?.paymentFor) {
      case "voting":
        await axios.post(`${process.env.BASE_URL}/api/v1/vote`, {
          contestant: metadata.contestantId,
          streetfood: metadata.foodId,
          qty: metadata.qty
        });
        break;

      case "registration":
        await axios.post(`${process.env.BASE_URL}/api/v1/contestant/register`, metadata.formData);
        break;
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
