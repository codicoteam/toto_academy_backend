const mongoose = require("mongoose");
const topic_content = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    file_path: {
      type: [String], // Array of strings
      required: true,
    },

    file_type: {
      type: String,
      enum: ["video", "audio", "document"],
      required: true,
    },
    Topic: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Subject model
      ref: "Topic", // The model to use for population
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("topic_content", topic_content);
