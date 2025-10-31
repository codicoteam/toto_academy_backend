const express = require("express");
const router = express.Router();
const progressService = require("../services/student_topic_progress_service");
const { authenticateToken } = require("../middlewares/auth");

// Update lesson *pointer* (indices). For scoring, use /progress.
router.post("/lesson-progress", authenticateToken, async (req, res) => {
  try {
    const { studentId, topicId, lessonIndex, subheadingIndex = 0, lessonId = null } =
      req.body;

    const progress = await progressService.updateLessonProgress(
      studentId,
      topicId,
      Number(lessonIndex),
      Number(subheadingIndex),
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

// Update topic progress (time + optional lesson scoring and/or indices)
router.post("/progress", authenticateToken, async (req, res) => {
  try {
    const {
      studentId,
      topicId,
      timeSpent = 0,

      // location pointers
      lessonIndex,
      subheadingIndex,

      // per-lesson scoring
      lessonid,
      lessonId,           // accepted alias
      lessonTitle,        // preferred name
      LesoonTitle,        // schema typo supported
      totalGot,
      percentage,
      completed,
    } = req.body;

    const lessonData =
      lessonIndex !== undefined ||
      subheadingIndex !== undefined ||
      lessonid !== undefined ||
      lessonId !== undefined ||
      lessonTitle !== undefined ||
      LesoonTitle !== undefined ||
      totalGot !== undefined ||
      percentage !== undefined ||
      completed !== undefined
        ? {
            lessonIndex,
            subheadingIndex,
            // choose lesson id if either provided
            lessonid: lessonid ?? lessonId ?? null,
            lessonTitle,
            LesoonTitle,
            totalGot,
            percentage,
            completed,
          }
        : null;

    const progress = await progressService.updateTopicProgress(
      studentId,
      topicId,
      Number(timeSpent) || 0,
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
router.get("/progress/:studentId/:topicId", authenticateToken, async (req, res) => {
  try {
    const { studentId, topicId } = req.params;
    const progress = await progressService.getTopicProgress(studentId, topicId);
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
});

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
    const inProgressTopics = await progressService.getInProgressTopics(studentId);
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
    const result = await progressService.checkAndResetStaleProgress(studentId, topicId);
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
