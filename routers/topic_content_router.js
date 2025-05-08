const express = require("express");
const router = express.Router();
const topicContentService = require("../services/topic_content_services"); // Adjust path as needed
const { authenticateToken } = require("../middlewares/auth");

// Create new topic content
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newContent = await topicContentService.createTopicContent(req.body);
    res
      .status(201)
      .json({
        message: "Topic content created successfully",
        data: newContent,
      });
  } catch (error) {
    res
      .status(400) // ✅ Export the new service
      .json({
        message: "Failed to create topic content",
        error: error.message,
      });
  }
});

// Get all topic contents
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const contentList = await topicContentService.getAllTopicContents();
    res
      .status(200)
      .json({
        message: "Topic contents retrieved successfully",
        data: contentList,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to retrieve topic contents",
        error: error.message,
      });
  }
});

// Get topic content by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const content = await topicContentService.getTopicContentById(
      req.params.id
    );
    res
      .status(200)
      .json({ message: "Topic content retrieved successfully", data: content });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Topic content not found", error: error.message });
  }
});

// Update topic content by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedContent = await topicContentService.updateTopicContent(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({
        message: "Topic content updated successfully",
        data: updatedContent,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Failed to update topic content",
        error: error.message,
      });
  }
});

// Delete topic content by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await topicContentService.deleteTopicContent(req.params.id);
    res.status(200).json({ message: "Topic content deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete topic content",
        error: error.message,
      });
  }
});

// Get topic contents by Topic ID
router.get("/by-topic/:topicId", authenticateToken, async (req, res) => {
  try {
    const contents = await topicContentService.getTopicContentByTopicId(
      req.params.topicId
    );
    res
      .status(200)
      .json({
        message: "Topic contents retrieved successfully",
        data: contents,
      });
  } catch (error) {
    res
      .status(404)
      .json({
        message: "No content found for this Topic ID",
        error: error.message,
      });
  }
});

module.exports = router;
