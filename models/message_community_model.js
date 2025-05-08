// models/CommunityMessage.js
const mongoose = require("mongoose");

const communityMessageSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    imagePath: {
      type: [String], // Array of image paths or URLs
      default: [],    // Optional field
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CommunityMessage", communityMessageSchema);
