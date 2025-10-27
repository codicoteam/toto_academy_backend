const HomeBanner = require("../models/home_banner_model"); // adjust path/file name as needed

const VALID_LEVELS = ["O Level", "A Level", "Others"];

// Create new banner
const createHomeBanner = async (bannerData) => {
  try {
    const banner = new HomeBanner(bannerData);
    await banner.save();
    return banner;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all banners
const getAllHomeBanners = async () => {
  try {
    return await HomeBanner.find().sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get banner by ID
const getHomeBannerById = async (id) => {
  try {
    const banner = await HomeBanner.findById(id);
    if (!banner) throw new Error("HomeBanner not found");
    return banner;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update banner by ID
const updateHomeBanner = async (id, updateData) => {
  try {
    const updated = await HomeBanner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new Error("HomeBanner not found");
    return updated;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete banner by ID
const deleteHomeBanner = async (id) => {
  try {
    const deleted = await HomeBanner.findByIdAndDelete(id);
    if (!deleted) throw new Error("HomeBanner not found");
    return deleted;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get banners by level
const getHomeBannersByLevel = async (level) => {
  try {
    if (!VALID_LEVELS.includes(level)) {
      throw new Error(
        `Invalid level. Allowed: ${VALID_LEVELS.join(", ")}`
      );
    }
    return await HomeBanner.find({ level }).sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Change showBanner (setter)
const setShowBanner = async (id, showBanner) => {
  try {
    if (typeof showBanner !== "boolean") {
      throw new Error("showBanner must be a boolean");
    }
    const updated = await HomeBanner.findByIdAndUpdate(
      id,
      { showBanner },
      { new: true }
    );
    if (!updated) throw new Error("HomeBanner not found");
    return updated;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createHomeBanner,
  getAllHomeBanners,
  getHomeBannerById,
  updateHomeBanner,
  deleteHomeBanner,
  getHomeBannersByLevel,
  setShowBanner,
};
