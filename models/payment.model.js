const Mongoose = require("mongoose");

const paymentSchema = Mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    metaData: {
      paymentFor: {
        // enum voting, registration, donation
        type: String,
        required: true,
        enum: ["voting", "registration", "donation"],
      },
      name: {
        type: String,
        required: true,
      },
      contestantId: {
        type: Mongoose.Types.ObjectId,
        ref: "Contestant",
      },
      channel: {
        type: String,
      },
      currency: {
        type: String,
        default: "NGN",
      },
    },
    email: {
      type: String,
      required: true,
    },
    season: {
      type: Mongoose.Types.ObjectId,
      ref: "Season",
      default: null,
    },
    reference: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Payment", paymentSchema);
