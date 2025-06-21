const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: [ "ecocash", "inn bucks",],
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    receiptId: {
      type: String,
      required: true,
    },
 
    paymentStatus: {
      type: String,
      enum: ["initiated", "processing", "paid", "cancelled", "failed"],
      default: "initiated",
    },
    pollUrl: {
      type: String,
      required: false, // Optional for online payments
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const PaymentModel = mongoose.model("Payment", paymentSchema);

module.exports = PaymentModel;
