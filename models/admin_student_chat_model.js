const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderModel: {
      type: String,
      enum: ["Student", "Admin"],
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    receiverModel: {
      type: String,
      enum: ["Student", "Admin"],
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverModel",
    },
    message: {
      type: String,
      required: true,
    },
    imageAttached: [
      {
        type: String,
        required: false,
      },
    ],
    topicContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topic_content",
      required: false,
    },
    lessonInfoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    messageType: {
      type: String,
      enum: ["general", "content_help_request"],
      default: "general",
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminStudentChat", chatMessageSchema);
