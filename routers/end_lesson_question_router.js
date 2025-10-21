const express = require("express");
const router = express.Router();
const quizService = require("../services/end_lesson_question_service");

// Create a new quiz
router.post("/", async (req, res) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz created successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all quizzes (non-deleted)
router.get("/", async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.status(200).json({
      success: true,
      data: quizzes,
      count: quizzes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get quizzes by topic_content_id
router.get("/content/:topicContentId", async (req, res) => {
  try {
    const quizzes = await quizService.getQuizzesByContentId(req.params.topicContentId);
    res.status(200).json({
      success: true,
      data: quizzes,
      count: quizzes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update quiz by ID
router.put("/:id", async (req, res) => {
  try {
    const quiz = await quizService.updateQuiz(req.params.id, req.body);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }
    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz updated successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Soft delete quiz
router.patch("/:id/soft-delete", async (req, res) => {
  try {
    const quiz = await quizService.softDeleteQuiz(req.params.id);
    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz moved to trash successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Restore soft deleted quiz
router.patch("/:id/restore", async (req, res) => {
  try {
    const quiz = await quizService.restoreQuiz(req.params.id);
    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz restored successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Permanent delete
router.delete("/:id/permanent", async (req, res) => {
  try {
    await quizService.permanentDeleteQuiz(req.params.id);
    res.status(200).json({
      success: true,
      message: "Quiz permanently deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all quizzes including deleted (admin only)
router.get("/admin/all", async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzesWithDeleted();
    res.status(200).json({
      success: true,
      data: quizzes,
      count: quizzes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get only deleted quizzes
router.get("/trash/all", async (req, res) => {
  try {
    const quizzes = await quizService.getDeletedQuizzes();
    res.status(200).json({
      success: true,
      data: quizzes,
      count: quizzes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete quizzes by topic_content_id
router.patch("/content/:topicContentId/soft-delete", async (req, res) => {
  try {
    const result = await quizService.deleteQuizzesByContentId(req.params.topicContentId);
    res.status(200).json({
      success: true,
      data: result,
      message: "Quizzes moved to trash successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Restore quizzes by topic_content_id
router.patch("/content/:topicContentId/restore", async (req, res) => {
  try {
    const result = await quizService.restoreQuizzesByContentId(req.params.topicContentId);
    res.status(200).json({
      success: true,
      data: result,
      message: "Quizzes restored successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get quiz count by topic_content_id
router.get("/content/:topicContentId/count", async (req, res) => {
  try {
    const count = await quizService.getQuizCountByContentId(req.params.topicContentId);
    res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;