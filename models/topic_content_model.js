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
    default: "no content",
    required: false,
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
      default: [], // Default to an empty array if no files are provided
      required: false,
    },
    file_type: {
      type: String,
      enum: ["video", "audio", "document"],
      default: "document", // Default to 'document' if not specified
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
