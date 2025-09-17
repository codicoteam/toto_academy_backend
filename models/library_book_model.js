const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cover_image: {
      type: String,
      required: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      enum: ["video", "audio", "document"],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    level: {
      type: String,
      enum: ["O Level", "A Level", "Others"],
      required: true,
    },
    // Add likes array to track student likes
    likes: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Track total likes count for easier queries
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("books", librarySchema);
