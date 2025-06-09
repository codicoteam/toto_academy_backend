const mongoose = require("mongoose");
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
    required: true,
  },
  video: {
    type: String,
    default: "no content",
  },
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
      type: [String], // Array of strings
      required: false,
    },
    file_type: {
      type: String,
      enum: ["video", "audio", "document"],
      required: true,
    },
    Topic: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Subject model
      ref: "Topic", // The model to use for population
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("topic_content", topic_content);
