const express = require("express");
const router = express.Router();
const topicService = require("../services/topic_in_subject_service"); // Adjust path as needed
const { authenticateToken } = require("../middlewares/auth");

// Create new topic
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newTopic = await topicService.createTopic(req.body);
    res
      .status(201)
      .json({ message: "Topic created successfully", data: newTopic });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create topic", error: error.message });
  }
});

// Get all topics
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const topicList = await topicService.getAllTopics();
    res
      .status(200)
      .json({ message: "Topics retrieved successfully", data: topicList });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve topics", error: error.message });
  }
});

// Get topic by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const topic = await topicService.getTopicById(req.params.id);
    res
      .status(200)
      .json({ message: "Topic retrieved successfully", data: topic });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Topic not found", error: error.message });
  }
});


// Get topic by ID
router.get("/gettopicbysubjectid/:id", authenticateToken, async (req, res) => {
  try {
    const topic = await topicService.getTopicsBySubjectId(req.params.id);
    res
      .status(200)
      .json({ message: "Topics retrieved successfully", data: topic });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Topics not found", error: error.message });
  }
});
// Update topic by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedTopic = await topicService.updateTopic(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ message: "Topic updated successfully", data: updatedTopic });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update topic", error: error.message });
  }
});

// Delete topic by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await topicService.deleteTopic(req.params.id);
    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete topic", error: error.message });
  }
});

module.exports = router;
