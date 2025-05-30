const mongoose = require("mongoose");

const recordExam = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    percentange: {
      type: String,
      required: true,
    },
    results: {
      type: String,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    ExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    showComment: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("RecordExam", recordExam);
