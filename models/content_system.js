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
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["O Level", "A Level", "Form 1", "Form 2", "Form 3", "Form 4"], // Extend as needed
      required: true,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

module.exports = mongoose.model("Content", contentSchema);
