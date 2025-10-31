const mongoose = require("mongoose");

const lessonProgressSchema = new mongoose.Schema(
  {
    lessonid: {
      type: String,
      required: false,
    },
    LesoonTitle: {  
      type: String,
      required: true,
    },
    totalGot: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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

    // Where the student currently is inside the topic
    currentLessonIndex: { type: Number, default: 0 },
    currentSubheadingIndex: { type: Number, default: 0 },

    // Fine-grained per-lesson progress
    lessonsProgress: {
      type: [lessonProgressSchema],
      default: [],
    },

    // Overall rollups (kept in sync from lessonsProgress)
    overallTotalGot: {
      type: Number,
      default: 0,
      min: 0,
    },
    overallPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },

    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    lastAccessed: { type: Date, default: null },

    // Topic-level time tracking
    timeSpent: { type: Number, default: 0 }, // minutes
    minimumTimeRequirementMet: { type: Boolean, default: false },

    // Optional daily rollup
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

// Efficient lookup
studentTopicProgressSchema.index({ student: 1, topic: 1 }, { unique: true });


mongoose.model(
  "StudentTopicProgress",
  studentTopicProgressSchema
);
