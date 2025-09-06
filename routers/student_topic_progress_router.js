const express = require("express");
const router = express.Router();
const progressService = require("../services/student_topic_progress_service");
const { authenticateToken } = require("../middlewares/auth");

// Update lesson progress
router.post("/lesson-progress", authenticateToken, async (req, res) => {
  try {
    const { studentId, topicId, lessonIndex, subheadingIndex, lessonId } =
      req.body;
    const progress = await progressService.updateLessonProgress(
      studentId,
      topicId,
      lessonIndex,
      subheadingIndex,
      lessonId
    );
    res.status(200).json({
      message: "Lesson progress updated successfully",
      data: progress,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update lesson progress",
      error: error.message,
    });
  }
});

// Update the existing progress route to accept lesson data
router.post("/progress", authenticateToken, async (req, res) => {
  try {
    const {
      studentId,
      topicId,
      timeSpent,
      lessonIndex,
      subheadingIndex,
      lessonId,
    } = req.body;
    const lessonData =
      lessonIndex !== undefined
        ? { lessonIndex, subheadingIndex, lessonId }
        : null;

    const progress = await progressService.updateTopicProgress(
      studentId,
      topicId,
      timeSpent,
      lessonData
    );
    res.status(200).json({
      message: "Progress updated successfully",
      data: progress,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update progress",
      error: error.message,
    });
  }
});

// Mark topic as completed
router.post("/complete", authenticateToken, async (req, res) => {
  try {
    const { studentId, topicId } = req.body;
    const progress = await progressService.completeTopic(studentId, topicId);
    res.status(200).json({
      message: "Topic marked as completed",
      data: progress,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to complete topic",
      error: error.message,
    });
  }
});

// Get progress for a specific topic
router.get(
  "/progress/:studentId/:topicId",
  authenticateToken,
  async (req, res) => {
    try {
      const { studentId, topicId } = req.params;
      const progress = await progressService.getTopicProgress(
        studentId,
        topicId
      );
      res.status(200).json({
        message: "Progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to retrieve progress",
        error: error.message,
      });
    }
  }
);

// Get all topics progress for a student
router.get("/progress/:studentId", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = await progressService.getAllTopicsProgress(studentId);
    res.status(200).json({
      message: "All progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve progress",
      error: error.message,
    });
  }
});

// Get completed topics for a student
router.get("/completed/:studentId", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const completedTopics = await progressService.getCompletedTopics(studentId);
    res.status(200).json({
      message: "Completed topics retrieved successfully",
      data: completedTopics,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve completed topics",
      error: error.message,
    });
  }
});

// Get in-progress topics for a student
router.get("/inprogress/:studentId", authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const inProgressTopics = await progressService.getInProgressTopics(
      studentId
    );
    res.status(200).json({
      message: "In-progress topics retrieved successfully",
      data: inProgressTopics,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to retrieve in-progress topics",
      error: error.message,
    });
  }
});

// Check and reset stale progress
router.post("/check-reset", authenticateToken, async (req, res) => {
  try {
    const { studentId, topicId } = req.body;
    const result = await progressService.checkAndResetStaleProgress(
      studentId,
      topicId
    );
    res.status(200).json({
      message: "Progress check completed",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to check progress",
      error: error.message,
    });
  }
});

module.exports = router;
