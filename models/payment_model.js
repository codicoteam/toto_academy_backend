const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: ["bank_transfer", "ecocash", "inn bucks", "other"],
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
  },
  paymentStatus: {
    type: String,
    enum: ["initiated", "processing", "paid", "cancelled", "failed"],
    default: "initiated",
  },
  pollUrl: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

const PaymentModel = mongoose.model("Payment", paymentSchema);

module.exports = PaymentModel;
// This model can be used to create, read, update, and delete payment records in your MongoDB database.
// Crud 5,