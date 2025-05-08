const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    Level: {
      type: String,
      required: true,
      enum: ["O Level", "A Level", "Form 1", "Form 2", "Form 3", "Form 4"],
    },
    showCommunity: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Community", communitySchema);
