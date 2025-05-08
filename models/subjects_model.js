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
      enum: ["O Level", "A Level", "Form 1", "Form 2", "Form 3", "Form 4"],
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
