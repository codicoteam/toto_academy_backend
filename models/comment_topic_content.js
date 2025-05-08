const mongoose = require("mongoose");

const contentTopicContentSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    topic_content_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topic_content",
      required: true,
    },
    comment_on_content: {
      type: String,
      required: true,
    },
    showComment: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("contentTopicContent", contentTopicContentSchema);
