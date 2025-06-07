const Mongoose = require("mongoose");

const paymentSchema = Mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    metaData: {
      paymentFor: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      comtestantId: {
        type: Mongoose.Types.ObjectId,
        ref: "Contestant",
      },
    },
    email: {
      type: String,
      required: true,
    },
    season: {
      type: Mongoose.Types.ObjectId,
      ref: "Season",
    },
    reference: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = Mongoose.model("Payment", paymentSchema);
