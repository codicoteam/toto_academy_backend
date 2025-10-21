const mongoose = require("mongoose");

const { Schema } = mongoose;

// Define schema for individual questions
const QuestionSchema = new Schema({
  questionText: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["open-ended", "multiple-choice"],
    required: true,
  },
  options: [
    {
      type: String,
      required: function () {
        return this.type === "multiple-choice";
      },
    },
  ],
  correctAnswer: {
    type: String,
    required: function () {
      return this.type === "multiple-choice";
    },
  },
});

// Define schema for a quiz or question set
const TopiiContentQuestionSchema = new Schema(
  {
    topic_content_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topic_content",
      required: true,
    },
    questions: [QuestionSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Soft delete method
TopiiContentQuestionSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
TopiiContentQuestionSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Export model
module.exports = mongoose.model("Quiz", TopiiContentQuestionSchema);