const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cover_image: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      enum: ["video", "audio", "document"],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Subject model
      ref: "Subject", // The model to use for population
      required: true,
    },
    level: {
      type: String,
      enum: ["O Level", "A Level", "Form 1", "Form 2", "Form 3", "Form 4"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);
