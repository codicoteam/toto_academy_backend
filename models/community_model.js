const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    Level: {
      type: String,
      required: true,
      enum: ["O Level", "A Level", "Others"],
    },
    showCommunity: {
      type: Boolean,
      default: true,
    },
    // 🔹 Add this field to allow Admins to manage/update the community
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Community", communitySchema);
