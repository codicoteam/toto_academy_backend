const express = require("express");
const router = express.Router();
const examService = require("../services/exam_service");
const { authenticateToken } = require("../middlewares/auth");

// Create new exam
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const newExam = await examService.createExam(req.body);
    res
      .status(201)
      .json({ message: "Exam created successfully", data: newExam });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create exam", error: error.message });
  }
});

// Get all exams
router.get("/getall", authenticateToken, async (req, res) => {
  try {
    const exams = await examService.getAllExams();
    res
      .status(200)
      .json({ message: "Exams retrieved successfully", data: exams });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve exams", error: error.message });
  }
});

// Get exam by ID
router.get("/get/:id", authenticateToken, async (req, res) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    res
      .status(200)
      .json({ message: "Exam retrieved successfully", data: exam });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Exam not found", error: error.message });
  }
});

// Update exam by ID
router.put("/update/:id", authenticateToken, async (req, res) => {
  try {
    const updatedExam = await examService.updateExam(req.params.id, req.body);
    res
      .status(200)
      .json({ message: "Exam updated successfully", data: updatedExam });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update exam", error: error.message });
  }
});

// Delete exam by ID
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    await examService.deleteExam(req.params.id);
    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete exam", error: error.message });
  }
});

module.exports = router;
