const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const Router = require("./routes");
const _db = require("./config/dbConnection");
require("dotenv").config();
require("./cronjob");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load("./utils/swagger.yaml");
const path = require("path");
const crypto = require("crypto");
const expressAsyncHandler = require("express-async-handler");
const paymentModel = require("./models/payment.model");
const seasonModel = require("./models/season.model");
const { default: fetch } = require("node-fetch");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS ---
app.use(cors({
  origin: "*", // restrict in production
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}));


// ✅ Use raw body only for webhook route
app.post(
  "/api/v1/payments/webhook",
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
      console.log({ metadata });
      // Find active season
      const season = await seasonModel.findOne({ current: true }).sort({ _id: -1 });
      const seasonId = season?._id || null;

      // Save payment
      await paymentModel.create({
        email,
        amount: amount / 100,
        season: seasonId,
        reference,
        metaData: {
          paymentFor: metadata.paymentFor,
          name: metadata.name,
          contestantId: metadata.contestantId,
          channel: metadata.channel,
          currency: metadata.currency,
        },
        status: "success",
        verifiedAt: new Date(),
      });

      // Trigger next action
      if (metadata?.paymentFor === "voting") {
        await axios.post(`${process.env.BASE_URL}/api/v1/contestants/vote`, {
          contestant: metadata.contestantId,
          streetfood: metadata.foodId,
          qty: metadata.qty,
        });
      }

      console.log(`✅ Webhook processed successfully for ${metadata?.paymentFor}`);
    } catch (err) {
      console.error("🚨 Webhook processing error:", err);
    }
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static files (uploads, etc.) ---
app.use("/uploads/images", express.static("./uploads/images"));

// --- API routes only ---
app.use(
  "/api",
  morgan((tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      content_length: tokens.res(req, res, "content-length"),
      response_time: `${tokens["response-time"](req, res)} ms`,
      remote_addr: tokens["remote-addr"](req, res),
      user_agent: tokens["user-agent"](req, res),
      timestamp: new Date().toISOString(),
    });
  })
);

app.use("/api/v1", Router);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDocs));

// --- API 404 handler ---
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found at all",
  });
});

// --- API error handler (only runs for API errors) ---
app.use("/api", errorHandler);

// --- Serve frontend build ---
app.use(express.static(path.join(__dirname, "client-build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client-build", "index.html"));
});

// --- Start DB + Server ---
_db().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
