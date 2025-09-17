const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    Level: {
      type: String,
      required: true,
      enum: ["O Level", "A Level", "Others"],
    },
    showSubject: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Subject", subjectSchema);
