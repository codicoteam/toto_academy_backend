const express = require("express");
const router = express.Router();
const contentService = require("../services/content_system_service"); // Adjust path as needed
const { authenticateToken } = require("../middlewares/auth");

// Create new content
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newContent = await contentService.createContent(req.body);
    res
      .status(201)
      .json({ message: "Content created successfully", data: newContent });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create content", error: error.message });
  }
});

// Get all content
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const contentList = await contentService.getAllContent();
    res
      .status(200)
      .json({ message: "Content retrieved successfully", data: contentList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve content", error: error.message });
  }
});

// Get content by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const content = await contentService.getContentById(req.params.id);
    res
      .status(200)
      .json({ message: "Content retrieved successfully", data: content });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Content not found", error: error.message });
  }
});

// Update content by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedContent = await contentService.updateContent(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ message: "Content updated successfully", data: updatedContent });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update content", error: error.message });
  }
});

// Delete content by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await contentService.deleteContent(req.params.id);
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete content", error: error.message });
  }
});

module.exports = router;
