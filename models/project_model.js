const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    regularPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    projectFileUrl: {
      type: String,
      required: true,
    },
    coverPhotoUrl: {
      type: String,
      required: true,
    },
    files: [
      {
        type: String,
      },
    ],
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["O Level", "A Level", "Others"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    purchasedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    showProject: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
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
  },
);

module.exports = mongoose.model("Project", projectSchema);
