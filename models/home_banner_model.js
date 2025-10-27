const mongoose = require('mongoose');

const HomeBannerSchema = new mongoose.Schema(
  {
    url_image: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["O Level", "A Level", "Others"],
    },
    showBanner: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
  }
);

module.exports = mongoose.model('HomeBanner', HomeBannerSchema);
