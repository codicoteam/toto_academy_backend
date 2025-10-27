const express = require("express");
const router = express.Router();
const bannerService = require("../services/home_banner_service");
const { authenticateToken } = require("../middlewares/auth");

// Helper: normalize ":level" path param (supports URL-encoded spaces and dashes)
const normalizeLevel = (raw) => decodeURIComponent(String(raw || ""))
  .replace(/-/g, " ")
  .trim();

// Create new banner
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const banner = await bannerService.createHomeBanner(req.body);
    res.status(201).json({ message: "HomeBanner created successfully", data: banner });
  } catch (error) {
    res.status(400).json({ message: "Failed to create HomeBanner", error: error.message });
  }
});

// Get all banners
router.get("/getall", authenticateToken, async (_req, res) => {
  try {
    const banners = await bannerService.getAllHomeBanners();
    res.status(200).json({ message: "HomeBanners retrieved successfully", data: banners });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve HomeBanners", error: error.message });
  }
});

// Get banner by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const banner = await bannerService.getHomeBannerById(req.params.id);
    res.status(200).json({ message: "HomeBanner retrieved successfully", data: banner });
  } catch (error) {
    res.status(404).json({ message: "HomeBanner not found", error: error.message });
  }
});

// Update banner by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updated = await bannerService.updateHomeBanner(req.params.id, req.body);
    res.status(200).json({ message: "HomeBanner updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Failed to update HomeBanner", error: error.message });
  }
});

// Delete banner by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await bannerService.deleteHomeBanner(req.params.id);
    res.status(200).json({ message: "HomeBanner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete HomeBanner", error: error.message });
  }
});

// Get banners by level
// Example: GET /home-banners/level/O%20Level  or  /home-banners/level/O-Level
router.get("/level/:level", authenticateToken, async (req, res) => {
  try {
    const level = normalizeLevel(req.params.level);
    const banners = await bannerService.getHomeBannersByLevel(level);
    res.status(200).json({ message: "HomeBanners by level retrieved successfully", data: banners });
  } catch (error) {
    res.status(400).json({ message: "Failed to retrieve by level", error: error.message });
  }
});

// Change showBanner (setter)
// Example: PUT /home-banners/show/652f...  body: { "showBanner": true }
router.put("/show/:id", authenticateToken, async (req, res) => {
  try {
    const { showBanner } = req.body;
    const updated = await bannerService.setShowBanner(req.params.id, showBanner);
    res.status(200).json({ message: "showBanner updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ message: "Failed to update showBanner", error: error.message });
  }
});

module.exports = router;
