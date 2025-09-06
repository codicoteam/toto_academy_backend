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
    enum: ["bank_transfer", "ecocash", "inn bucks", "other"],
  },
  reference: {
    type: String,
    required: true,
  },
  pollUrl: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "expired"],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: function () {
      return this.type === "withdrawal";
    },
  },
  isExpired: {
    type: Boolean,
    default: false,
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

// Index for expiration check
walletSchema.index({ "withdrawals.expiresAt": 1 });

module.exports = mongoose.model("Wallet", walletSchema);
