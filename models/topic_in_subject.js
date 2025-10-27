const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    subjectName: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    showTopic: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    regularPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    subscriptionPeriod: {
      type: String,
      required: true,
    },
    topicContentRequests: {
      type: Number,
      default: 0,
    },
    // --- Soft delete fields ---
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Topic", topicSchema);
