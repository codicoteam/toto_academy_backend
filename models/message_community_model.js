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
      required: true,
      refPath: "senderModel", // Use dynamic reference based on senderModel field
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Student", "Admin"], // Specify which models can be senders
    },
    message: {
      type: String,
      required: true,
    },
    imagePath: {
      type: [String], // Array of image paths or URLs
      default: [], // Optional field
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
