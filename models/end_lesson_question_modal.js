const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Individual question schema (unchanged)
 */
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

/**
 * Quiz schema – now scoped to a specific lesson inside topic_content
 */
const TopiiContentQuestionSchema = new Schema(
  {
    // Parent topic_content document
    topic_content_id: {
      type: Schema.Types.ObjectId,
      ref: "topic_content",
      required: true,
      index: true,
    },

    // The embedded lesson's _id within topic_content.lesson[]
    lesson_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Questions for this lesson
    questions: {
      type: [QuestionSchema],
      default: [],
    },

    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Compound index to speed up lookups per topic/lesson and avoid duplicates.
 * If you want to enforce a single quiz per (topic_content_id, lesson_id), uncomment unique:true.
 */
TopiiContentQuestionSchema.index(
  { topic_content_id: 1, lesson_id: 1 },
  { unique: true } // <- enable if you want only one quiz per lesson
);


TopiiContentQuestionSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

TopiiContentQuestionSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

/**
 * Useful statics
 */
TopiiContentQuestionSchema.statics.findByLesson = function ({
  topic_content_id,
  lesson_id,
  includeDeleted = false,
}) {
  const query = {
    topic_content_id,
    lesson_id,
  };
  if (!includeDeleted) query.isDeleted = false;
  return this.find(query);
};

TopiiContentQuestionSchema.statics.upsertForLesson = async function ({
  topic_content_id,
  lesson_id,
  questions,
}) {
  return this.findOneAndUpdate(
    { topic_content_id, lesson_id },
    { $set: { questions, isDeleted: false, deletedAt: null } },
    { new: true, upsert: true }
  );
};

module.exports = mongoose.model("Quiz", TopiiContentQuestionSchema);
