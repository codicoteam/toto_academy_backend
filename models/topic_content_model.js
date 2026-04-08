const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: "lesson.comments.replies.userType",
  },
  userType: {
    type: String,
    required: false,
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

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // ✅ Changed from true to false to prevent validation errors from corrupt data
    refPath: "lesson.comments.userType",
  },
  userType: {
    type: String,
    required: false, // ✅ Changed to false for safety
    enum: ["Admin", "Student"],
  },
  text: {
    type: String,
    required: false, // ✅ Changed to false for safety
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // ✅ KEY FIX: was `true`, causing your 400 error
    refPath: "lesson.reactions.userType",
  },
  userType: {
    type: String,
    required: false, // ✅ Changed to false for safety
    enum: ["Admin", "Student"],
  },
  emoji: {
    type: String,
    required: false, // ✅ Changed to false for safety
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const mcqQuestionSchema = new mongoose.Schema({
  question: { type: String, required: false },
  options: { type: [String], required: false },
  correctAnswer: { type: String, required: false },
  explanation: { type: String, required: false },
});

const addSubheading = new mongoose.Schema({
  text: { type: String, required: false },
  subheadingAudioPath: { type: String, required: false },
  question: { type: String, required: false },
  expectedAnswer: { type: String, required: false },
  comment: { type: String, required: false },
  hint: { type: String, required: false },
  mcqQuestions: [mcqQuestionSchema],
  timingArray: { type: [Number], default: [] },
});

const lessonInfo = new mongoose.Schema({
  text: { type: String, required: true },
  subHeading: [addSubheading],
  audio: { type: String, default: "no content", required: false },
  video: { type: String, default: "no content" },
  comments: [commentSchema],
  reactions: [reactionSchema],
});

const topic_content = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    lesson: [lessonInfo],
    file_path: { type: [String], default: [], required: false },
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
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("topic_content", topic_content);
