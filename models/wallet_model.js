const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal"],
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: ["bank_transfer", "card", "crypto", "other"],
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
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
});

const walletSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    deposits: [walletTransactionSchema],
    withdrawals: [walletTransactionSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
