const mongoose = require("mongoose");

// Define a schema for comment replies
const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: "comments.userType", // Dynamic reference based on userType
  },
  userType: {
    type: String,
    required: true,
    enum: ["Admin", "Student"],
  },
  text: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define a schema for comments
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "comments.userType", // Dynamic reference based on userType
  },
  userType: {
    type: String,
    required: true,
    enum: ["Admin", "Student"],
  },
  text: {
    type: String,
    required: true,
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define a schema for emoji reactions
const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "reactions.userType", // Dynamic reference based on userType
  },
  userType: {
    type: String,
    required: true,
    enum: ["Admin", "Student"],
  },
  emoji: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const addSubheading = new mongoose.Schema({
  text: {
    type: String,
    required: false,
  },
  subheadingAudioPath: {
    type: String,
    required: false,
  },
  question: {
    type: String,
    required: false,
  },
  expectedAnswer: {
    type: String,
    required: false,
  },
  comment: {
    type: String,
    required: false,
  },
  hint: {
    type: String,
    required: false,
  },
});
const lessonInfo = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  subHeading: [addSubheading],
  audio: {
    type: String,
    default: "no content",
    required: false,
  },
  video: {
    type: String,
    default: "no content",
  },

  comments: [commentSchema],
  reactions: [reactionSchema],
});

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
    lesson: [lessonInfo],
    file_path: {
      type: [String],
      default: [],
      required: false,
    },
    file_type: {
      type: String,
      enum: ["video", "audio", "document"],
      default: "document",
    },
    Topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    // Add these fields for trash functionality
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("topic_content", topic_content);
