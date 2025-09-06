const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderModel: {
      type: String,
      enum: ["Student", "Admin"], // Who sent the message
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "messages.senderModel", // dynamic ref
    },
    receiverModel: {
      type: String,
      enum: ["Student", "Admin"], // Who receives the message
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "messages.receiverModel", // dynamic ref
    },
    message: {
      type: String,
      required: true,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminStudentChat", chatMessageSchema);
