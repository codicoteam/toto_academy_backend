const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["O Level", "A Level", "Form 1", "Form 2", "Form 3", "Form 4"],
    },
    authorFullName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    showBook: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);
// make sure to have api to get one by subject id 
