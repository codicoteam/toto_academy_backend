const express = require("express");
const router = express.Router();
const quizService = require("../services/end_lesson_question_service");

// ---------- LESSON-SCOPED ROUTES (topic_content_id + lesson_id) ----------

// Upsert (create or replace) a quiz for a specific lesson
router.post("/content/:topicContentId/lesson/:lessonId", async (req, res) => {
  try {
    const { topicContentId, lessonId } = req.params;
    const { questions } = req.body; // expect { questions: [...] }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Field 'questions' is required and must be a non-empty array",
      });
    }

    const quiz = await quizService.upsertQuizForLesson({
      topic_content_id: topicContentId,
      lesson_id: lessonId,
      questions,
    });

    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz upserted successfully for the lesson",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get a quiz for a specific lesson
router.get("/content/:topicContentId/lesson/:lessonId", async (req, res) => {
  try {
    const { topicContentId, lessonId } = req.params;
    const quiz = await quizService.getQuizByContentAndLesson(
      topicContentId,
      lessonId
    );
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quiz by (topic_content_id, lesson_id)
router.put("/content/:topicContentId/lesson/:lessonId", async (req, res) => {
  try {
    const { topicContentId, lessonId } = req.params;
    const quiz = await quizService.updateQuizByContentAndLesson(
      topicContentId,
      lessonId,
      req.body
    );
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz updated successfully for the lesson",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Soft delete by (topic_content_id, lesson_id)
router.patch(
  "/content/:topicContentId/lesson/:lessonId/soft-delete",
  async (req, res) => {
    try {
      const { topicContentId, lessonId } = req.params;
      const result = await quizService.softDeleteByContentAndLesson(
        topicContentId,
        lessonId
      );
      res.status(200).json({
        success: true,
        data: result,
        message: "Quiz(es) moved to trash successfully for the lesson",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Restore by (topic_content_id, lesson_id)
router.patch(
  "/content/:topicContentId/lesson/:lessonId/restore",
  async (req, res) => {
    try {
      const { topicContentId, lessonId } = req.params;
      const result = await quizService.restoreByContentAndLesson(
        topicContentId,
        lessonId
      );
      res.status(200).json({
        success: true,
        data: result,
        message: "Quiz(es) restored successfully for the lesson",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Count by (topic_content_id, lesson_id)
router.get(
  "/content/:topicContentId/lesson/:lessonId/count",
  async (req, res) => {
    try {
      const { topicContentId, lessonId } = req.params;
      const count = await quizService.getQuizCountByContentAndLesson(
        topicContentId,
        lessonId
      );
      res.status(200).json({ success: true, count });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ---------- EXISTING CONTENT-SCOPED ROUTES (topic_content_id only) ----------

// Get quizzes by topic_content_id
router.get("/content/:topicContentId", async (req, res) => {
  try {
    const quizzes = await quizService.getQuizzesByContentId(
      req.params.topicContentId
    );
    res
      .status(200)
      .json({ success: true, data: quizzes, count: quizzes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk soft delete by topic_content_id
router.patch("/content/:topicContentId/soft-delete", async (req, res) => {
  try {
    const result = await quizService.deleteQuizzesByContentId(
      req.params.topicContentId
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Quizzes moved to trash successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk restore by topic_content_id
router.patch("/content/:topicContentId/restore", async (req, res) => {
  try {
    const result = await quizService.restoreQuizzesByContentId(
      req.params.topicContentId
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Quizzes restored successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Count by topic_content_id
router.get("/content/:topicContentId/count", async (req, res) => {
  try {
    const count = await quizService.getQuizCountByContentId(
      req.params.topicContentId
    );
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- GLOBAL / ID-SCOPED ROUTES ----------

// Create a new quiz by body (expects topic_content_id & lesson_id in body)
router.post("/", async (req, res) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res
      .status(201)
      .json({
        success: true,
        data: quiz,
        message: "Quiz created successfully",
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all quizzes (non-deleted)
router.get("/", async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res
      .status(200)
      .json({ success: true, data: quizzes, count: quizzes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get only deleted quizzes
router.get("/trash/all", async (req, res) => {
  try {
    const quizzes = await quizService.getDeletedQuizzes();
    res
      .status(200)
      .json({ success: true, data: quizzes, count: quizzes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all quizzes including deleted (admin)
router.get("/admin/all", async (req, res) => {
  try {
    const quizzes = await quizService.getAllQuizzesWithDeleted();
    res
      .status(200)
      .json({ success: true, data: quizzes, count: quizzes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quiz by ID
router.put("/:id", async (req, res) => {
  try {
    const quiz = await quizService.updateQuiz(req.params.id, req.body);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        data: quiz,
        message: "Quiz updated successfully",
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Soft delete quiz by ID
router.patch("/:id/soft-delete", async (req, res) => {
  try {
    const quiz = await quizService.softDeleteQuiz(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        data: quiz,
        message: "Quiz moved to trash successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore soft deleted quiz by ID
router.patch("/:id/restore", async (req, res) => {
  try {
    const quiz = await quizService.restoreQuiz(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        data: quiz,
        message: "Quiz restored successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Permanent delete by ID
router.delete("/:id/permanent", async (req, res) => {
  try {
    await quizService.permanentDeleteQuiz(req.params.id);
    res
      .status(200)
      .json({
        success: true,
        message: "Quiz permanently deleted successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
