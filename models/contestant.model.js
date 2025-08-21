const Mongoose = require("mongoose");

const contestantSchema = Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    performanceType: {
      type: String,
      required: true,
    },
    socials: {
      tiktok: {
        type: String,
      },
      instagram: {
        type: String,
      },
    },
    email: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    season: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Season",
    },
    group: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "audition",
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Contestant", contestantSchema);
