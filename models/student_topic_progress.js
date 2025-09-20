const mongoose = require("mongoose");
const studentTopicProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topic_content",
      required: true,
    },
    // Add these fields to track progress within the topic content
    currentLessonIndex: {
      type: Number,
      default: 0,
    },
    currentSubheadingIndex: {
      type: Number,
      default: 0,
    },
  
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    minimumTimeRequirementMet: {
      type: Boolean,
      default: false,
    },
    dailyProgress: [
      {
        date: Date,
        timeSpent: Number,
        completed: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);
// Index for efficient queries
studentTopicProgressSchema.index({ student: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model(
  "StudentTopicProgress",
  studentTopicProgressSchema
);
