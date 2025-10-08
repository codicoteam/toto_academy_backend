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
      default: 0, // Optional: Set default price
    },
    regularPrice: {
      type: Number,
      required: true,
      default: 0, // Optional: Set default regular price
    },
    subscriptionPeriod: {
      type: String,
      required: true, // Means by default it's not under subscription
    },
    topicContentRequests: {
      type: Number,
      default: 0, // start at 0
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Topic", topicSchema);
